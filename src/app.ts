import { Jobs } from './types';
import { readConfig } from './config';
import { isArray, isNil } from 'lodash';
import {
  buildGoogleMediaItemsById,
  googleGetAlbum,
  googleListAlbums,
  mergeFromTakeout,
  getAllMediaItems,
  downloadGooglePhotos,
  initializeKeywordCollections
} from './jobs';

readConfig('/Users/tedshaffer/Documents/Projects/pgPhotoManagement/src/config/config.env');

const optionDefinitions = [
  { name: 'job', alias: 'j', type: String },
  { name: 'parameters', type: String, multiple: true },
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)
console.log(options);

async function main() {

  console.log('main invoked');

  const { job, parameters } = getCommandLineArguments(options);

  switch (options.job) {
    case Jobs.DownloadGooglePhotos:
      console.log('DownloadGooglePhotos');
      if (parameters.length !== 1) {
        debugger;
      }
      await downloadGooglePhotos(parameters[0]);
      break;
    case Jobs.BuildGoogleMediaItemsById:
      console.log('BuildGoogleMediaItemsById');
      if (parameters.length !== 1) {
        debugger;
      }
      await buildGoogleMediaItemsById(parameters[0]);
      break;
    case Jobs.ListGoogleAlbums:
      console.log('ListGoogleAlbums');
      await googleListAlbums();
      break;
    case Jobs.GetGoogleAlbum:
      console.log('GetGoogleAlbum');
      if (parameters.length !== 1) {
        debugger;
      }
      await googleGetAlbum(parameters[0]);
      break;
    case Jobs.AddMediaItemsFromSingleTakeout:
      console.log('AddMediaItemsFromSingleTakeout');
      if (parameters.length !== 2) {
        debugger;
      }
      const albumName: string = parameters[0];
      const takeoutFolder: string = parameters[1];
      await mergeFromTakeout(albumName, takeoutFolder);
      break;
    case Jobs.GetAllMediaItems:
      console.log('GetAllMediaItems');
      await getAllMediaItems();
      break;
    case Jobs.InitializeKeywordCollections:
      console.log('InitializeKeywordCollections');
      await initializeKeywordCollections();
      break;
    default:
      debugger;
  }

  console.log('job execution complete');
}

const getCommandLineArguments = (options: any) => {
  if (isNil(options.job)) {
    debugger;
  }
  const parameters: string[] = [];
  if (isArray(options.parameters)) {
    for (const parameter of options.parameters) {
      parameters.push(parameter);
    }
  }

  return {
    job: options.job,
    parameters
  };
}

main();
