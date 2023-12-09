import * as path from 'path';
import * as fse from 'fs-extra';

import { MediaItem } from "entities";
import request from 'request';
import { isNil } from "lodash";
import { AuthService } from "../auth";
import { fsLocalFolderExists, fsCreateNestedDirectory } from "../utils";
import { GooglePhotoAPIs } from "./googlePhotos";
import { getHeaders, getRequest } from './googleUtils';
import { updateMediaItemInDb } from './dbInterface';

export const downloadMediaItems = async (authService: AuthService, mediaItemGroups: MediaItem[][], mediaItemsDir: string): Promise<any> => {
  for (const mediaItemGroup of mediaItemGroups) {
    if (!isNil(mediaItemGroup)) {
      for (const mediaItem of mediaItemGroup) {
        const retVal: any = await (downloadMediaItem(authService, mediaItem, mediaItemsDir));
        console.log(retVal);
        if (retVal.valid) {
          mediaItem.filePath = retVal.where;
          await updateMediaItemInDb(mediaItem);
        } else {
          debugger;
        }
      }
    }
  }
};

const downloadMediaItem = async (authService: AuthService, mediaItem: MediaItem, mediaItemsDir: string): Promise<any> => {

  const fileSuffix = path.extname(mediaItem.fileName);
  const fileName = mediaItem.googleId + fileSuffix;

  const baseDir: string = await getShardedDirectory(mediaItemsDir, false, mediaItem.googleId);
  const where = path.join(baseDir, fileName);

  // if file exists at 'where', don't redownload
  if (fse.existsSync(where)) {
    const ret: any = { valid: true, where, mediaItem };
    return Promise.resolve(ret);
  }

  const stream = await createDownloadStream(authService, mediaItem);
  return new Promise((resolve, reject) => {
    stream.pipe(fse.createWriteStream(where)
      .on('close', () => {
        // this._setFileTimestamp(where, mediaItem);
        resolve({ valid: true, where, mediaItem });
      }))
      .on('error', (err: any) => {
        resolve({ valid: false, where, mediaItem });
      });
  });
};

const createDownloadStream = async (authService: AuthService, mediaItem: MediaItem) => {
  // const headers = await getHeaders(authService);
  // const url: string = await createDownloadUrl(mediaItem);

  // // return request(url, { headers });
  // return getRequest(authService, url);

  const headers = await getHeaders(authService);
  const url: string = await createDownloadUrl(mediaItem);

  return request(url, { headers });

};


const createDownloadUrl = async (mediaItem: MediaItem) => {

  let downloadParams = '';

  const { width, height } = mediaItem;

  if (isNil(width) || isNil(height)) {
    debugger;
  }

  // TEDTODO
  // if ((mediaItem.mediaMetadata as any).video) {
  //   downloadParams += 'dv';
  // }

  // if (mediaItem.mediaMetadata.photo) {
  //   const { width, height } = mediaItem.mediaMetadata;
  //   downloadParams += `w${width}-h${height}`;
  // }

  downloadParams += `w${width}-h${height}`;
  return `${mediaItem.baseUrl}=${downloadParams}`;
};

let shardedDirectoryExistsByPath: any = {};

export const getShardedDirectory = async (mediaItemsDir: string, useCache: boolean, photoId: string): Promise<string> => {
  const numChars = photoId.length;
  const targetDirectory = path.join(
    mediaItemsDir,
    photoId.charAt(numChars - 2),
    photoId.charAt(numChars - 1),
  );

  if (useCache && shardedDirectoryExistsByPath.hasOwnProperty(targetDirectory)) {
    return Promise.resolve(targetDirectory);
  }
  return fsLocalFolderExists(targetDirectory)
    .then((dirExists: boolean) => {
      shardedDirectoryExistsByPath[targetDirectory] = true;
      if (dirExists) {
        return Promise.resolve(targetDirectory);
      }
      else {
        return fsCreateNestedDirectory(targetDirectory)
          .then(() => {
            return Promise.resolve(targetDirectory);
          });
      }
    })
    .catch((err: Error) => {
      console.log(err);
      return Promise.reject();
    });
};


export const downloadMediaItemsMetadata = async (authService: AuthService, mediaItems: MediaItem[]): Promise<void> => {

  if (!isNil(mediaItems)) {

    const mediaItemsById: any = {};
    for (const mediaItem of mediaItems) {
      mediaItemsById[mediaItem.googleId] = mediaItem;
    }

    let url = `${GooglePhotoAPIs.mediaItems}:batchGet?`;

    mediaItems.forEach((mediaItem: MediaItem) => {
      const mediaItemId = mediaItem.googleId;
      url += `mediaItemIds=${mediaItemId}&`;
    });

    const result: any = await getRequest(authService, url);

    const mediaItemResults: any[] = result.mediaItemResults;

    for (const mediaItemResult of mediaItemResults) {
      const googleId = mediaItemResult.mediaItem.id;
      if (!mediaItemsById.hasOwnProperty(googleId)) {
        debugger;
      }
      const mediaItem: MediaItem = mediaItemsById[googleId];
      mediaItem.baseUrl = mediaItemResult.mediaItem.baseUrl;
      mediaItem.productUrl = mediaItemResult.mediaItem.productUrl;
      mediaItem.baseUrl = mediaItemResult.mediaItem.baseUrl;
    }

    // const googleMediaItems: GoogleMediaItem[] = mediaItemResults.map((mediaItemResult: any) => {
    //   return mediaItemResult.mediaItem;
    // });

    // return googleMediaItems;

  }

};

