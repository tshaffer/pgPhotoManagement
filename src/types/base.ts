import { MediaItem } from "entities";
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

export type StringToMediaItem = {
  [key: string]: MediaItem;
}

export enum Jobs {
  DownloadGooglePhotos = 'DownloadGooglePhotos',
  BuildGoogleMediaItemsById = 'BuildGoogleMediaItemsById',
  ListGoogleAlbums = 'ListGoogleAlbums',
  GetGoogleAlbum = 'GetGoogleAlbum',
  AddMediaItemsFromSingleTakeout = 'AddMediaItemsFromSingleTakeout',
  GetAllMediaItems = 'GetAllMediaItems',
  InitializeKeywordCollections = 'InitializeKeywordCollections'
}

export interface PgPhotoManagementConfiguration {
  MONGO_URI: string;
}

