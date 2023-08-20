import { getMediaitemModel } from "../models";
import { MediaItem } from "../types/entities";

export const addMediaItemToDb = async (mediaItem: MediaItem): Promise<any> => {

  const mediaItemModel = getMediaitemModel();

  try {
    return mediaItemModel.collection.insertOne(mediaItem)
    .then((retVal: any) => {
      const dbRecordId: string = retVal.insertedId._id.toString();
      return;
    })
    .catch( (error: any) => {
      console.log('db add error: ', error);
      if (error.code === 11000) {
        return;
      } else {
        debugger;
      }
    });
  } catch(error: any) {
    debugger;
  }
};

