import {
  exiftool,
  Tags
} from 'exiftool-vendored';

// import { FilePathToExifTags } from '../types';

// export let filePathsToExifTags: FilePathToExifTags = {};

const getExifData = async (filePath: string): Promise<any> => {
  try {
    const tags: Tags = await exiftool.read(filePath);
    return tags;  
  } catch (error: any) {
    console.log('getExifData failed on: ', filePath);
    debugger;
  }
};

export const retrieveExifData = async (filePath: string): Promise<Tags> => {
  const exifData: Tags = await getExifData(filePath);
  return exifData;
  // let exifData: Tags;
  // if (filePathsToExifTags.hasOwnProperty(filePath)) {
  //   exifData = filePathsToExifTags[filePath];
  // } else {
  //   exifData = await getExifData(filePath);
  //   filePathsToExifTags[filePath] = exifData;
  // }
  // return exifData;
}

