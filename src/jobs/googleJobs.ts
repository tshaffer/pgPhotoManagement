import { isNil, isEqual } from "lodash";

import path from 'path';
import * as fs from 'fs-extra';

import { AuthService } from "../auth";
import { getAuthService } from "../controllers/googlePhotosService";
import {
  FilePathToExifTags,
  GoogleAlbum,
  GoogleMediaItem,
  GoogleMediaItemsByIdInstance,
  IdToGoogleMediaItemArray,
  MediaItem,
  StringToMediaItem,
  StringToStringLUT
} from "../types";
import {
  getAllMediaItemsFromGoogle,
  getAllGoogleAlbums,
  getGoogleAlbumData,
  getGoogleAlbumDataByName,
  getAlbumMediaItemsFromGoogle,
  getMediaItemFromGoogle,
  GooglePhotoAPIs
} from "../controllers/googlePhotos";
import {
  getImageFilePaths,
  getJsonFilePaths,
  getJsonFromFile,
  isImageFile,
  retrieveExifData,
  writeJsonToFile
} from '../utils';
import connectDB from "../config/db";
import {
  addMediaItemToDb,
  getMediaItemsInAlbumFromDb,
  getAllMediaItemsFromDb,
  updateMediaItemInDb,
  deleteMediaItemFromDb,
  downloadMediaItems,
  downloadMediaItemsMetadata
} from "../controllers";
import { Tags } from "exiftool-vendored";

export let authService: AuthService;

export const downloadGooglePhotos = async (mediaItemsDir: string) => {

  const mediaItemsToDownload: MediaItem[] = [];

  await connectDB();

  const mediaItems: MediaItem[] = await getAllMediaItems();
  for (const mediaItem of mediaItems) {
    const filePath = mediaItem.filePath;
    if (isNil(filePath) || filePath.length === 0 || (!fs.existsSync(filePath))) {
      mediaItemsToDownload.push(mediaItem);
    }
  }

  const mediaItemGoogleIds: string[] = mediaItems.map((mediaItem: MediaItem) => {
    return mediaItem.googleId;
  });

  // const groups: string[][] = createGroups(mediaItemGoogleIds, GooglePhotoAPIs.BATCH_GET_LIMIT);
  // console.log(groups);

  const mediaItemGroups: MediaItem[][] = createGroups(mediaItemsToDownload, GooglePhotoAPIs.BATCH_GET_LIMIT);
  console.log(mediaItemGroups);

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  const miniMediaItemGroups: MediaItem[][] = [mediaItemGroups[0], mediaItemGroups[1]];
  await Promise.all(
    miniMediaItemGroups.map((mediaItems: MediaItem[]) => {
      return downloadMediaItemsMetadata(authService, mediaItems);
    }
  ));
  
  // const googleMediaItemGroups: GoogleMediaItem[][] = await Promise.all(groups.map((sliceIds: any) => {
  //   return downloadMediaItemsMetadata(authService, sliceIds);
  // }));

  downloadMediaItems(authService, miniMediaItemGroups, mediaItemsDir);

  return Promise.resolve();
}

function createGroups(mediaItems: MediaItem[], groupSize: number): MediaItem[][] {

  const groups: MediaItem[][] = [];

  const numOfGroups = Math.ceil(mediaItems.length / groupSize);
  for (let i = 0; i < numOfGroups; i++) {
    const startIdx = i * groupSize;
    const endIdx = i * groupSize + groupSize;

    const subItems: MediaItem[] = mediaItems.slice(startIdx, endIdx);
    groups.push(subItems);
  }

  return groups;
}



export const buildGoogleMediaItemsById = async (filePath: string) => {

  if (isNil(authService)) {
    authService = await getAuthService();
  }
  const googleMediaItems: GoogleMediaItem[] = await getAllMediaItemsFromGoogle(authService);
  console.log(googleMediaItems);

  const googleMediaItemsById: IdToGoogleMediaItemArray = {};
  for (const googleMediaItem of googleMediaItems) {
    if (!googleMediaItemsById.hasOwnProperty(googleMediaItem.id)) {
      googleMediaItemsById[googleMediaItem.id] = [];
    }
    googleMediaItemsById[googleMediaItem.id].push(googleMediaItem);
  }

  const googleMediaItemsByIdInstance: GoogleMediaItemsByIdInstance = {
    creationDate: new Date().toISOString(),
    googleMediaItemsById,
  };

  await writeJsonToFile(
    filePath,
    googleMediaItemsByIdInstance
  );

}

export const getAllMediaItems = async (): Promise<MediaItem[]> => {
  console.log('connect to db');
  await connectDB();

  const allMediaItems: MediaItem[] = await getAllMediaItemsFromDb();

  console.log('Number of mediaItems retrieved: ' + allMediaItems.length);

  return allMediaItems;
}


// get googleMediaItems for named album
const getAlbumItems = async (authService: AuthService, albumId: string): Promise<GoogleMediaItem[]> => {
  const googleMediaItemsInAlbum: GoogleMediaItem[] = await getAlbumMediaItemsFromGoogle(authService, albumId, null);
  return googleMediaItemsInAlbum;
}

//  input parameters
//    albumName - corresponding to takeout file
//    takeoutFolder - folder containing metadata for the files retrieved from a single takeout
export const mergeFromTakeout = async (albumName: string, takeoutFolder: string) => {

  console.log('mergeFromTakeout');

  // Step 0
  // connect to db; acquire authService
  await connectDB();
  if (isNil(authService)) {
    authService = await getAuthService();
  }

  // Step 1
  // get the google album metadata for named album
  const googleAlbum: GoogleAlbum | null = await getGoogleAlbumDataByName(authService, albumName);
  if (isNil(googleAlbum)) {
    // TEDTODO
    // if album does not exist, inform user and return
    return;
  };
  const albumId = googleAlbum.id;
  // const albumId = 'AEEKk93_i7XXOBVcq3lfEtP2XOEkjUtim6tm9HjkimxvIC7j8y2o-e0MPazRGr5nlAgf_OAyGxYX';
  // const albumId = 'AEEKk93_i7XXOBVcq3lfEtP2XOEkjUtim6tm9HjkimxvIC7j8y2o-e0MPazRGr5nlAgf_OAyGxYX';

  // Step 2
  // get the googleMediaItems for this album
  const googleMediaItemsInAlbum: GoogleMediaItem[] = await getAlbumItems(authService, albumId);

  // Step 3
  // Get existing db mediaItems for this album
  const mediaItemsInDb: MediaItem[] = await getMediaItemsInAlbumFromDb(albumId);

  // Step 4
  if (mediaItemsInDb.length === 0) {
    // If there are no mediaItems in the db for this album, add all the mediaItems in the album
    await addAllMediaItemsFromTakeout(takeoutFolder, googleMediaItemsInAlbum, albumId);
  } else {
    // There are existing mediaItems in the db for this album. Compare the existing mediaItems in the db with the mediaItems in the album (and the takeout)
    await mergeMediaItemsFromAlbumWithDb(takeoutFolder, googleMediaItemsInAlbum, albumId, mediaItemsInDb);
  }

}

export const addAllMediaItemsFromTakeout = async (takeoutFolder: string, googleMediaItemsInAlbum: GoogleMediaItem[], albumId: string) => {

  // retrieve metadata files and image files from takeout folder
  const takeoutMetaDataFilePaths: string[] = await getJsonFilePaths(takeoutFolder);
  const takeoutImageFilePaths: string[] = await getImageFilePaths(takeoutFolder);

  console.log(takeoutMetaDataFilePaths.length);
  console.log(takeoutImageFilePaths.length);

  const takeoutMetaDataFilePathsByImageFileName: StringToStringLUT = {};
  const takeoutExifDataByImageFileName: FilePathToExifTags = {};
  for (const imageFilePath of takeoutImageFilePaths) {
    const takeoutMetadataFilePath = imageFilePath + '.json';
    const indexOfMetaDataFilePath = takeoutMetaDataFilePaths.indexOf(takeoutMetadataFilePath);
    if (indexOfMetaDataFilePath >= 0) {
      takeoutMetaDataFilePathsByImageFileName[path.basename(imageFilePath)] = takeoutMetadataFilePath;
    }
    const exifData: Tags = await retrieveExifData(imageFilePath);
    takeoutExifDataByImageFileName[path.basename(imageFilePath)] = exifData;
  };


  // iterate through each media item in the album.
  // if it is an image file, see if there is a corresponding entry in the takeout folder
  for (const mediaItemMetadataFromGoogleAlbum of googleMediaItemsInAlbum) {

    const googleFileName = mediaItemMetadataFromGoogleAlbum.filename;

    if (isImageFile(googleFileName)) {
      if (takeoutMetaDataFilePathsByImageFileName.hasOwnProperty(googleFileName)) {

        const takeoutMetaDataFilePath = takeoutMetaDataFilePathsByImageFileName[googleFileName];
        const takeoutMetadata: any = await getJsonFromFile(takeoutMetaDataFilePath);

        let exifData: Tags | null = null;
        if (takeoutExifDataByImageFileName.hasOwnProperty(googleFileName)) {
          exifData = takeoutExifDataByImageFileName[googleFileName];
        }

        console.log('googleMediaItem from album');
        console.log(mediaItemMetadataFromGoogleAlbum);

        console.log('takeoutMetadata');
        console.log(takeoutMetadata);

        const dbMediaItem: MediaItem = {
          googleId: mediaItemMetadataFromGoogleAlbum.id,
          fileName: mediaItemMetadataFromGoogleAlbum.filename,
          albumId,
          filePath: '',
          productUrl: valueOrNull(mediaItemMetadataFromGoogleAlbum.productUrl),
          baseUrl: valueOrNull(mediaItemMetadataFromGoogleAlbum.baseUrl),
          mimeType: valueOrNull(mediaItemMetadataFromGoogleAlbum.mimeType),
          creationTime: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.creationTime),
          width: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.width, true),
          height: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.height, true),
          orientation: isNil(exifData) ? null : valueOrNull(exifData.Orientation),
          description: isNil(exifData) ? null : valueOrNull(takeoutMetadata.description),
          geoData: valueOrNull(takeoutMetadata.geoData),
          people: valueOrNull(takeoutMetadata.people),
        }

        await addMediaItemToDb(dbMediaItem);

      }
    }
  }

  console.log('db additions complete');

}

export const mergeTakeoutAlbumWithDb = async (mediaItemsInDb: MediaItem[], takeoutFolder: string, googleMediaItemsInAlbum: GoogleMediaItem[], albumId: string) => {
}

export const getTakeoutAlbumMediaItems = async (takeoutFolder: string, googleMediaItemsInAlbum: GoogleMediaItem[], albumId: string): Promise<MediaItem[]> => {

  const mediaItems: MediaItem[] = [];

  // retrieve metadata files and image files from takeout folder
  const takeoutMetaDataFilePaths: string[] = await getJsonFilePaths(takeoutFolder);
  const takeoutImageFilePaths: string[] = await getImageFilePaths(takeoutFolder);

  const takeoutMetaDataFilePathsByImageFileName: StringToStringLUT = {};
  const takeoutExifDataByImageFileName: FilePathToExifTags = {};
  for (const imageFilePath of takeoutImageFilePaths) {
    const takeoutMetadataFilePath = imageFilePath + '.json';
    const indexOfMetaDataFilePath = takeoutMetaDataFilePaths.indexOf(takeoutMetadataFilePath);
    if (indexOfMetaDataFilePath >= 0) {
      takeoutMetaDataFilePathsByImageFileName[path.basename(imageFilePath)] = takeoutMetadataFilePath;
    }
    const exifData: Tags = await retrieveExifData(imageFilePath);
    takeoutExifDataByImageFileName[path.basename(imageFilePath)] = exifData;
  };

  // iterate through each media item in the album.
  // if it is an image file, see if there is a corresponding entry in the takeout folder
  for (const mediaItemMetadataFromGoogleAlbum of googleMediaItemsInAlbum) {

    const googleFileName = mediaItemMetadataFromGoogleAlbum.filename;

    if (isImageFile(googleFileName)) {
      if (takeoutMetaDataFilePathsByImageFileName.hasOwnProperty(googleFileName)) {

        const takeoutMetaDataFilePath = takeoutMetaDataFilePathsByImageFileName[googleFileName];
        const takeoutMetadata: any = await getJsonFromFile(takeoutMetaDataFilePath);

        let exifData: Tags | null = null;
        if (takeoutExifDataByImageFileName.hasOwnProperty(googleFileName)) {
          exifData = takeoutExifDataByImageFileName[googleFileName];
        }

        const mediaItem: MediaItem = {
          googleId: mediaItemMetadataFromGoogleAlbum.id,
          fileName: mediaItemMetadataFromGoogleAlbum.filename,
          albumId,
          filePath: '',
          productUrl: valueOrNull(mediaItemMetadataFromGoogleAlbum.productUrl),
          mimeType: valueOrNull(mediaItemMetadataFromGoogleAlbum.mimeType),
          creationTime: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.creationTime),
          width: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.width, true),
          height: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.height, true),
          orientation: isNil(exifData) ? null : valueOrNull(exifData.Orientation),
          description: isNil(exifData) ? null : valueOrNull(takeoutMetadata.description),
          geoData: valueOrNull(takeoutMetadata.geoData),
          people: valueOrNull(takeoutMetadata.people),
        }

        mediaItems.push(mediaItem);

      }
    }
  }

  return mediaItems;
}

// mediaItems for this album exist in the db
export const mergeMediaItemsFromAlbumWithDb = async (takeoutFolder: string, googleMediaItemsInAlbum: GoogleMediaItem[], albumId: string, mediaItemsInDb: MediaItem[]) => {

  // get the items from the album / takeout
  const takeoutAlbumMediaItems: MediaItem[] = await getTakeoutAlbumMediaItems(takeoutFolder, googleMediaItemsInAlbum, albumId);

  // for mediaItemsInDb, create LUT for faster searches
  const mediaItemInDbByGoogleId: StringToMediaItem = {};
  mediaItemsInDb.forEach((mediaItemInDb: MediaItem) => {
    mediaItemInDbByGoogleId[mediaItemInDb.googleId] = mediaItemInDb;
  });

  const takeoutAlbumMediaItemsByGoogleId: StringToMediaItem = {};
  takeoutAlbumMediaItems.forEach((takeoutAlbumMediaItem: MediaItem) => {
    takeoutAlbumMediaItemsByGoogleId[takeoutAlbumMediaItem.googleId] = takeoutAlbumMediaItem;
  });

  // iterate through each item in the album / takeout
  // if it doesn't exist in db, add it
  // if it exists in the db, compare it
  //    if identical, do nothing
  //    if changed, replace
  for (const takeoutAlbumMediaItem of takeoutAlbumMediaItems) {
    const googleIdForTakeoutMediaItem = takeoutAlbumMediaItem.googleId;
    if (mediaItemInDbByGoogleId.hasOwnProperty(googleIdForTakeoutMediaItem)) {
      // item exists in both - compare
      const mediaItemInDb = mediaItemInDbByGoogleId[googleIdForTakeoutMediaItem];
      // if mediaItems are different - replace existing; else, do nothing
      if (!mediaItemsIdentical(takeoutAlbumMediaItem, mediaItemInDb)) {
        console.log('not identical');
        updateMediaItemInDb(takeoutAlbumMediaItem);
      }
    } else {
      // item doesn't exist in db; add it.
      await addMediaItemToDb(takeoutAlbumMediaItem);
    }
  }

  // iterate through each item in the db
  //    if it doesn't in the album / takeout, remove it from the db
  for (const mediaItemInDb of mediaItemsInDb) {
    if (!takeoutAlbumMediaItemsByGoogleId.hasOwnProperty(mediaItemInDb.googleId)) {
      deleteMediaItemFromDb(mediaItemInDb);
    }
  }
}

const mediaItemsIdentical = (mediaItemFromTakeout: MediaItem, mediaItemFromDb: MediaItem): boolean => {
  delete (mediaItemFromDb as any)._id;
  return isEqual(mediaItemFromTakeout, mediaItemFromDb);
}

const valueOrNull = (possibleValue: any, convertToNumber: boolean = false): any | null => {
  if (isNil(possibleValue)) {
    return null;
  }
  if (convertToNumber) {
    possibleValue = parseInt(possibleValue);
  }
  return possibleValue;
}


export const googleListAlbums = async () => {

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  const googleAlbums: GoogleAlbum[] = await getAllGoogleAlbums(authService);
  console.log('googleAlbums');
  console.log(googleAlbums);
}

export const googleGetAlbum = async (id: string) => {

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  const googleAlbum: GoogleAlbum = await getGoogleAlbumData(authService, id);
  console.log(googleAlbum);

}

