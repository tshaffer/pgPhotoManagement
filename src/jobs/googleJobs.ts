import { isNil } from "lodash";

import { AuthService } from "../auth";
import { getAuthService } from "../controllers/googlePhotosService";
import { 
  GoogleAlbum,
  GoogleMediaItem, 
  GoogleMediaItemsByIdInstance, 
  IdToGoogleMediaItemArray 
} from "../types";
import { getAllMediaItemsFromGoogle, getAllGoogleAlbums, getGoogleAlbumData, getGoogleAlbumDataByName, getAlbumMediaItemsFromGoogle } from "../controllers/googlePhotos";
import { getImageFilePaths, getJsonFilePaths, writeJsonToFile } from '../utils';

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
  const metaDataFilePaths: string[] = await getJsonFilePaths(takeoutFolder);
  const imageFilePaths: string[] = await getImageFilePaths(takeoutFolder);

  console.log(metaDataFilePaths.length);
  console.log(imageFilePaths.length);

  debugger;

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  const googleAlbum: GoogleAlbum | null = await getGoogleAlbumDataByName(authService, albumName);
  console.log(googleAlbum);

  if (!isNil(googleAlbum)) {
    const albumId: string = googleAlbum.id;
    // const albumId: string = 'AEEKk93_i7XXOBVcq3lfEtP2XOEkjUtim6tm9HjkimxvIC7j8y2o-e0MPazRGr5nlAgf_OAyGxYX';

    const data = await getAlbumMediaItemsFromGoogle(authService, albumId, null);
    debugger;
  }
  // const fileNames: string[] = fs.readdirSync(takeoutFolder);

  // console.log(fileNames);

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

