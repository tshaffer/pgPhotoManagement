import mongoose from 'mongoose';

export let connection: mongoose.Connection;

import { pgPhotoManagementConfiguration } from './config';

async function connectDB() {

  console.log('mongo uri is:');
  console.log(pgPhotoManagementConfiguration.MONGO_URI);
  connection = await mongoose.createConnection(pgPhotoManagementConfiguration.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }); 
  console.log(`MongoDB new db connected`);

  mongoose.Promise = global.Promise;
};

export default connectDB;
