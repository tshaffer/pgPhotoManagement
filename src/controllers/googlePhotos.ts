import request from 'request';

import { GoogleAlbum, GoogleMediaItem } from "../types";
import { AuthService } from "../auth";
import { isArray, isNil } from 'lodash';

export const GooglePhotoAPIs = {
  mediaItems: 'https://photoslibrary.googleapis.com/v1/mediaItems',
  albums: 'https://photoslibrary.googleapis.com/v1/albums',
  album: 'https://photoslibrary.googleapis.com/v1/albums/',
  mediaItemsSearch: 'https://photoslibrary.googleapis.com/v1/mediaItems:search',
  BATCH_GET_LIMIT: 49
};

export const getAllMediaItemsFromGoogle = async (authService: AuthService, nextPageToken: any = null): Promise<GoogleMediaItem[]> => {

  const googleMediaItems: GoogleMediaItem[] = [];

  let url = GooglePhotoAPIs.mediaItems;

  do {

    if (nextPageToken != null) {
      url = `${GooglePhotoAPIs.mediaItems}?pageToken=${nextPageToken}`;
    }

    try {

      const response: any = await getRequest(authService, url);

      console.log(response);

      if (!isNil(response)) {
        if (isArray(response.mediaItems)) {
          response.mediaItems.forEach((mediaItem: GoogleMediaItem) => {
            googleMediaItems.push(mediaItem);
          });
        }
        else {
          console.log('response.mediaItems is not array');
        }
        nextPageToken = response.nextPageToken;
      }
      else {
        console.log('response is nil');
      }

      console.log('number of googleMediaItems: ' + googleMediaItems.length);

    } catch (err) {
      nextPageToken = null;
    }

  } while (nextPageToken != null);

  return googleMediaItems;
};

export const getAlbumMediaItemsFromGoogle = async (authService: AuthService, albumId: string, nextPageToken: any = null): Promise<GoogleMediaItem[]> => {

  const googleMediaItems: GoogleMediaItem[] = [];

  let url = GooglePhotoAPIs.mediaItemsSearch;

  do {

    if (nextPageToken != null) {
      url = `${GooglePhotoAPIs.mediaItems}?pageToken=${nextPageToken}`;
    }

    try {

      const response: any = await getRequest(authService, url);

      console.log(response);

      if (!isNil(response)) {
        if (isArray(response.mediaItems)) {
          response.mediaItems.forEach((mediaItem: GoogleMediaItem) => {
            googleMediaItems.push(mediaItem);
          });
        }
        else {
          console.log('response.mediaItems is not array');
        }
        nextPageToken = response.nextPageToken;
      }
      else {
        console.log('response is nil');
      }

      console.log('number of googleMediaItems: ' + googleMediaItems.length);

    } catch (err) {
      nextPageToken = null;
    }

  } while (nextPageToken != null);

  return googleMediaItems;
}

export const getGoogleAlbumDataByName = async (authService: AuthService, albumName: string): Promise<GoogleAlbum | null> => {

  const googleAlbums: GoogleAlbum[] = await getAllGoogleAlbums(authService);

  for (const googleAlbum of googleAlbums) {
    if (googleAlbum.title === albumName) {
      return googleAlbum;
    }
  }

  return null;
}

export const getAllGoogleAlbums = async (authService: AuthService, nextPageToken: any = null): Promise<GoogleAlbum[]> => {

  const googleAlbums: GoogleAlbum[] = [];

  let url = GooglePhotoAPIs.albums;

  do {

    if (nextPageToken != null) {
      url = `${GooglePhotoAPIs.albums}?pageToken=${nextPageToken}`;
    }

    try {

      const response: any = await getRequest(authService, url);
      if (!isNil(response)) {
        if (isArray(response.albums)) {
          response.albums.forEach((album: any) => {
            googleAlbums.push(album);
          });
        }
        else {
          console.log('response.albums is not array');
        }
        nextPageToken = response.nextPageToken;
      }
      else {
        console.log('response is nil');
      }

    } catch (err) {
      nextPageToken = null;
    }
  } while (nextPageToken != null);

  return googleAlbums;
};

export const getGoogleAlbumData = async (authService: AuthService, albumId: string): Promise<GoogleAlbum> => {

  const url = `${GooglePhotoAPIs.album}${albumId}`;

  const response: any = await getRequest(authService, url);
  console.log(response);

  const { coverPhotoBaseUrl, coverPhotoMediaItemId, id, mediaItemsCount, productUrl, title } = response;
  const googleAlbum: GoogleAlbum = {
    coverPhotoBaseUrl,
    coverPhotoMediaItemId,
    id,
    mediaItemsCount,
    productUrl,
    title,
  }
  return googleAlbum;
}

const getRequest = async (authService: AuthService, url: string) => {

  const headers = await getHeaders(authService);

  return new Promise((resolve, reject) => {
    request(url, { headers }, (err, resp, body) => {
      if (err) {
        return reject(`Error when GET ${url} ${err}`);
      }
      try {
        body = JSON.parse(body);
      } catch (err) {
        return reject(`Error parsing response body ${err}`);
      }
      if (!!body.error) {
        const { code, message, status } = body.error;
        return reject(`Error _getRequest ${url} ${code} ${message} ${status}`);
      }
      resolve(body);
    });
  });
};

const getHeaders = async (authService: AuthService) => {
  const authToken = await authService.getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken.access_token}`
  };
};

