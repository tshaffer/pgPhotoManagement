import * as dotenv from 'dotenv';
import { isNil } from 'lodash';
import { PgPhotoManagementConfiguration } from '../types';

export let pgPhotoManagementConfiguration: PgPhotoManagementConfiguration;

export const readConfig = (pathToConfigFile: string): void => {

  try {
    const configOutput: dotenv.DotenvConfigOutput = dotenv.config({ path: pathToConfigFile });
    const parsedConfig: dotenv.DotenvParseOutput | undefined = configOutput.parsed;

    if (!isNil(parsedConfig)) {
      pgPhotoManagementConfiguration = {
        MONGO_URI: parsedConfig.MONGO_URI,
      };
      console.log(pgPhotoManagementConfiguration);
    }
  }
  catch (err) {
    console.log('Dotenv config error: ' + err.message);
  }
};
