import { isNil } from "lodash";

import path from 'path';

import { AuthService } from "../auth";
import { getAuthService } from "../controllers/googlePhotosService";
import {
  FilePathToExifTags,
  GoogleAlbum,
  GoogleMediaItem,
  GoogleMediaItemsByIdInstance,
  IdToGoogleMediaItemArray,
  MediaItem,
  StringToStringLUT
} from "../types";
import { getAllMediaItemsFromGoogle, getAllGoogleAlbums, getGoogleAlbumData, getGoogleAlbumDataByName, getAlbumMediaItemsFromGoogle, getMediaItemFromGoogle } from "../controllers/googlePhotos";
import { getImageFilePaths, getJsonFilePaths, getJsonFromFile, isImageFile, retrieveExifData, writeJsonToFile } from '../utils';
import connectDB from "../config/db";
import { addMediaItemToDb, getAllMediaItemsFromDb } from "../controllers";
import { Tags } from "exiftool-vendored";

export let authService: AuthService;


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

export const getAllMediaItems = async () => {
  console.log('connect to db');
  await connectDB();

  const allMediaItems: MediaItem[] = await getAllMediaItemsFromDb();

  console.log('Number of mediaItems retrieved: ' + allMediaItems.length);
}


//  input parameters
//    albumName - corresponding to takeout file
//    takeoutFolder - folder containing metadata for the files retrieved from a single takeout
export const addMediaItemsFromSingleTakeout = async (albumName: string, takeoutFolder: string) => {

  console.log('addMediaItemsFromSingleTakeout');

  console.log('connect to db');
  await connectDB();

  console.log(takeoutFolder);

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

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  // get the google album associated with the specified album name
  // const googleAlbum: GoogleAlbum | null = await getGoogleAlbumDataByName(authService, albumName);
  // if (isNil(googleAlbum)) { return };
  // console.log(googleAlbum);

  // const albumId: string = googleAlbum.id;
  // const albumId: string = 'AEEKk93_i7XXOBVcq3lfEtP2XOEkjUtim6tm9HjkimxvIC7j8y2o-e0MPazRGr5nlAgf_OAyGxYX';
  const albumId: string = 'AEEKk92H41_rvghQJIFmYvp35lHhQfqZFb9-CpABuE6Y8IahAKtEuCUXKs_2QRF_Ixs1Puzamc5y';
  // get the list of media items in the specified album
  const googleMediaItemsInAlbum: GoogleMediaItem[] = await getAlbumMediaItemsFromGoogle(authService, albumId, null);

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
          mimeType: valueOrNull(mediaItemMetadataFromGoogleAlbum.mimeType),
          creationTime: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.creationTime),
          width: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.width, true),
          height: valueOrNull(mediaItemMetadataFromGoogleAlbum.mediaMetadata.height, true),
          orientation: isNil(exifData) ? null : valueOrNull(exifData.Orientation),
          description: isNil(exifData) ? null : valueOrNull(takeoutMetadata.description),
          geoData: valueOrNull(takeoutMetadata.geoData),
          imageViews: valueOrNull(takeoutMetadata.imageViews, true),
          people: valueOrNull(takeoutMetadata.people),
        }

        await addMediaItemToDb(dbMediaItem);

      }
    }
  }

  console.log('db additions complete');
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

