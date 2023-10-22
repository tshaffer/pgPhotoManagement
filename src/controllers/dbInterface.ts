import { v4 as uuidv4 } from 'uuid';
import { getTagModel } from "../models/Tag";
import { getMediaitemModel } from "../models";
import {
  MediaItem,
  Tag,
} from "../types/entities";

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

export const addTagsSetToDb = async (type: string, tagsSet: Set<string>): Promise<void> => {

  const existingTags = await getAllTagsFromDb();
  const existingTagNames: string[] = existingTags.map((aTag: Tag) => {
    return aTag.label;
  })
  const existingTagsSet: Set<string> = new Set<string>(existingTagNames);

  const tagsToAddToDb: Tag[] = [];

  for (let tag of tagsSet) {
    if (!existingTagsSet.has(tag)) {
      tagsToAddToDb.push({
        id: uuidv4(),
        label: tag,
        type,
      });
    }
  }

  if (tagsToAddToDb.length > 0) {
    const tagModel = getTagModel();
    try {
      return tagModel.collection.insertMany(tagsToAddToDb)
        .then((retVal: any) => {
          console.log('tags added successfully');
          console.log(retVal);
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
  }
}

export const getAllTagsFromDb = async (): Promise<Tag[]> => {

  const tagModel = getTagModel();

  const tags: Tag[] = [];
  const documents: any = await (tagModel as any).find().exec();
  for (const document of documents) {
    const tag: Tag = document.toObject() as Tag;
    tag.id = document.id.toString();
    tag.label = document.label.toString();
    tags.push(tag);
  }
  return tags;
}

export const createTagDocument = async (tag: Tag): Promise<Document | void> => {

  const tagModel = getTagModel();

  return tagModel.create(tag)
    .then((tagDocument: any) => {
      console.log('createTagDocument: value returned from tagModel.create:');
      console.log(tagDocument);
      return Promise.resolve(tagDocument);
    }).catch((err: any) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        console.log('Duplicate key error in createTagDocument: ', tag);
      }
      // return Promise.reject(err);
      return Promise.resolve();
    });
};


