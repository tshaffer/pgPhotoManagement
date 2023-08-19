import { Jobs } from './types';
import { readConfig } from './config';
import { isArray, isNil } from 'lodash';
import { buildGoogleMediaItemsById, getGoogleAlbumData, listGoogleAlbums } from './jobs/googleJobs';
import { getAllGoogleAlbums } from './controllers/googlePhotos';

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
    case Jobs.BuildGoogleMediaItemsById:
      console.log('BuildGoogleMediaItemsById');
      if (parameters.length !== 1) {
        debugger;
      }
      await buildGoogleMediaItemsById(parameters[0]);
      break;
    case Jobs.ListGoogleAlbums:
      console.log('ListGoogleAlbums');
      await listGoogleAlbums();
      break;
    case Jobs.GetGoogleAlbum:
      console.log('GetGoogleAlbum');
      if (parameters.length !== 1) {
        debugger;
      }
      await getGoogleAlbumData(parameters[0]);
      break;

  }
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
