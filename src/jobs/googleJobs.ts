import { isNil } from "lodash";

import { AuthService } from "../auth";
import { getAuthService } from "../controllers/googlePhotosService";
import { GoogleMediaItem, GoogleMediaItemsByIdInstance, IdToGoogleMediaItemArray } from "../types";
import { getAllMediaItemsFromGoogle, getAllGoogleAlbums } from "../controllers/googlePhotos";
import { writeJsonToFile } from '../utils';

let authService: AuthService;


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

export const listGoogleAlbums = async () => {

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  getAllGoogleAlbums(authService);

}

export const getGoogleAlbumData = async (id: string) => {

  if (isNil(authService)) {
    authService = await getAuthService();
  }

  getAllGoogleAlbums(authService);

}

