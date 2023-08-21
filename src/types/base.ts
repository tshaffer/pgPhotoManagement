import { Tags } from "exiftool-vendored";
import { GoogleMediaItem } from "googleTypes";

export type StringToStringLUT = {
  [key: string]: string;
}

export interface FilePathToExifTags {
  [key: string]: Tags;
}

export type StringToGoogleMediaItem = {
  [key: string]: GoogleMediaItem;
}

export enum Jobs {
  BuildGoogleMediaItemsById = 'BuildGoogleMediaItemsById',
  ListGoogleAlbums = 'ListGoogleAlbums',
  GetGoogleAlbum = 'GetGoogleAlbum',
  AddMediaItemsFromSingleTakeout = 'AddMediaItemsFromSingleTakeout',
}

export interface PgPhotoManagementConfiguration {
  MONGO_URI: string;
}

