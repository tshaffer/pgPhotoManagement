import { Jobs } from './types';
import { readConfig } from './config';

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

  switch (options.job) {
    case Jobs.BuildGoogleMediaItemsById:
      console.log('BuildGoogleMediaItemsById');
      // await buildGoogleMediaItemsById();
      break;
  }
}
