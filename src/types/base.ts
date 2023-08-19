export enum Jobs {
  BuildGoogleMediaItemsById = 'BuildGoogleMediaItemsById',
  ListGoogleAlbums = 'ListGoogleAlbums',
  GetGoogleAlbum = 'GetGoogleAlbum',
}

export interface PgPhotoManagementConfiguration {
  MONGO_URI: string;
}

