export enum Jobs {
  BuildGoogleMediaItemsById = 'BuildGoogleMediaItemsById',
  ListGoogleAlbums = 'ListGoogleAlbums',
  GetGoogleAlbum = 'GetGoogleAlbum',
  AddMediaItemsFromSingleTakeout='AddMediaItemsFromSingleTakeout',
}

export interface PgPhotoManagementConfiguration {
  MONGO_URI: string;
}

