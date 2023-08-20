import { GoogleMediaItem } from "googleTypes";

export type StringToStringLUT = {
  [key: string]: string;
}

export type StringToGoogleMediaItem = {
  [key: string]: GoogleMediaItem;
}

export enum Jobs {
  BuildGoogleMediaItemsById = 'BuildGoogleMediaItemsById',
  ListGoogleAlbums = 'ListGoogleAlbums',
  GetGoogleAlbum = 'GetGoogleAlbum',
  AddMediaItemsFromSingleTakeout='AddMediaItemsFromSingleTakeout',
}

export interface PgPhotoManagementConfiguration {
  MONGO_URI: string;
}

