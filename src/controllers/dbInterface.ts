import { getMediaitemModel } from "../models";
import { MediaItem } from "../types/entities";

export const getAllMediaItemsFromDb = async (): Promise<MediaItem[]> => {

  const mediaItemModel = getMediaitemModel();

  const mediaItems: MediaItem[] = [];
  // const documents: any = await (mediaItemModel as any).find().limit(100).exec();
  const documents: any = await (mediaItemModel as any).find().exec();
  for (const document of documents) {
    const mediaItem: MediaItem = document.toObject() as MediaItem;
    mediaItem.googleId = document.googleId.toString();
    mediaItems.push(mediaItem);
  }
  return mediaItems;
}

export const getMediaItemsInAlbumFromDb = async (albumId: string): Promise<MediaItem[]> => {

  const mediaItemModel = getMediaitemModel();

  const mediaItems: MediaItem[] = [];
  const documents: any = await (mediaItemModel as any).find({ albumId }).exec();
  for (const document of documents) {
    const mediaItem: MediaItem = document.toObject() as MediaItem;
    mediaItem.googleId = document.googleId.toString();
    mediaItems.push(mediaItem);
  }
  return mediaItems;
}



export const addMediaItemToDb = async (mediaItem: MediaItem): Promise<any> => {

  const mediaItemModel = getMediaitemModel();

  try {
    return mediaItemModel.collection.insertOne(mediaItem)
      .then((retVal: any) => {
        const dbRecordId: string = retVal.insertedId._id.toString();
        return;
      })
      .catch((error: any) => {
        console.log('db add error: ', error);
        if (error.code === 11000) {
          return;
        } else {
          debugger;
        }
      });
  } catch (error: any) {
    debugger;
  }
};

export const updateMediaItemInDb = async (mediaItem: MediaItem): Promise<any> => {
  const mediaItemModel = getMediaitemModel();
  const filter = { googleId: mediaItem.googleId };
  const updatedDoc = await mediaItemModel.findOneAndUpdate(filter, mediaItem, {
    new: true,
  }).exec();
};

export const deleteMediaItemFromDb = async (mediaItem: MediaItem): Promise<any> => {
  const mediaItemModel = getMediaitemModel();
  const filter = { googleId: mediaItem.googleId };
  await mediaItemModel.deleteOne(filter);
}