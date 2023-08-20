import { isNil } from "lodash";

import path from 'path';

import { AuthService } from "../auth";
import { getAuthService } from "../controllers/googlePhotosService";
import {
  GoogleAlbum,
  GoogleMediaItem,
  GoogleMediaItemsByIdInstance,
  IdToGoogleMediaItemArray,
  StringToGoogleMediaItem,
  StringToStringLUT
} from "../types";
import { getAllMediaItemsFromGoogle, getAllGoogleAlbums, getGoogleAlbumData, getGoogleAlbumDataByName, getAlbumMediaItemsFromGoogle } from "../controllers/googlePhotos";
import { getImageFilePaths, getJsonFilePaths, isImageFile, writeJsonToFile } from '../utils';

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

//  input parameters
//    albumName - corresponding to takeout file
//    takeoutFolder - folder containing metadata for the files retrieved from a single takeout
export const addMediaItemsFromSingleTakeout = async (albumName: string, takeoutFolder: string) => {

  console.log('addMediaItemsFromSingleTakeout');

  console.log(takeoutFolder);

  // retrieve metadata files and image files from takeout folder
  const metaDataFilePaths: string[] = await getJsonFilePaths(takeoutFolder);
  const imageFilePaths: string[] = await getImageFilePaths(takeoutFolder);

  console.log(metaDataFilePaths.length);
  console.log(imageFilePaths.length);

  const metaDataFilePathsByImageFileName: StringToStringLUT = {};
  imageFilePaths.forEach((imageFilePath: string) => {
    const metadataFilePath = imageFilePath + '.json';
    const indexOfMetaDataFilePath = metaDataFilePaths.indexOf(metadataFilePath);
    if (indexOfMetaDataFilePath >= 0) {
      metaDataFilePathsByImageFileName[path.basename(imageFilePath)] = metadataFilePath;
    }
  });

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  // get the google album associated with the specified album name
  // const googleAlbum: GoogleAlbum | null = await getGoogleAlbumDataByName(authService, albumName);
  // if (isNil(googleAlbum)) { return };
  // console.log(googleAlbum);

  // const albumId: string = googleAlbum.id;
  const albumId: string = 'AEEKk93_i7XXOBVcq3lfEtP2XOEkjUtim6tm9HjkimxvIC7j8y2o-e0MPazRGr5nlAgf_OAyGxYX';

  // get the list of media items in the specified album
  const mediaItemsInAlbum: GoogleMediaItem[] = await getAlbumMediaItemsFromGoogle(authService, albumId, null);

  // iterate through each media item in the album.
  // if it is an image file, see if there is a corresponding entry in the takout
  const myLUT: StringToGoogleMediaItem = {};
  mediaItemsInAlbum.forEach((mediaItemInAlbum: GoogleMediaItem) => {
    const googleFileName = mediaItemInAlbum.filename;
    if (isImageFile(googleFileName)) {
      if (metaDataFilePathsByImageFileName.hasOwnProperty(googleFileName)) {
        myLUT[googleFileName] = mediaItemInAlbum;
      }
    }
  });

  console.log(myLUT);
  
  debugger;
}


export const googleListAlbums = async () => {

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  getAllGoogleAlbums(authService);

}

export const googleGetAlbum = async (id: string) => {

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  const googleAlbum: GoogleAlbum = await getGoogleAlbumData(authService, id);
  console.log(googleAlbum);

}

