import * as mongoose from 'mongoose';
import { connection } from '../config';

const Schema = mongoose.Schema;

const MediaitemSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },     // album media metadata: id
    fileName: { type: String, required: true },                   // album media metadata: filename
    filePath: { type: String, default: '' },
    baseUrl: { type: String },                                   // album media metadata: baseUrl
    productUrl: { type: String },                                 // album media metadata: productUrl
    mimeType: { type: String },                                   // album media metadata: mimeType
    creationTime: { type: String },                                 // album media metadata: mediaMetadata.creationTime (string)
    // or takeout metadata.creationTime (object)
    width: { type: Number },                                      // album media metadata: mediaMetadata.width
    height: { type: Number },                                     // album media metadata: mediaMetadata.height
    orientation: { type: Number, default: 0 },                    // exif - orientation - number
    description: { type: String, default: '' },                   // exif - description - string. others?
    gpsPosition: { type: String, default: '' },                   // exif - gpsPosition - string
    geoData: {
      altitude: { type: Number },
      latitude: { type: Number },
      latitudeSpan: { type: Number },
      longitude: { type: Number },
      longitudeSpan: { type: Number },
    },
    // googlePhotosOrigin: { type: String, default: ''},
    imageViews: { type: Number, default: 0 },                   // number as string
    // mediaMetadata: { type: String, default: '' },                // object
    people: [{
      name: String, default: ''
    }],
    photoTakenTime: {
      formatted: { type: String, default: '' },
      timestamp: { type: String, default: '' },
    },
    title: { type: String, default: '' },
    url: { type: String, default: '' },
    // googlePhoto
  }
);

export const getMediaitemModel = () => {
  const mediaItemModel = connection.model('mediaitem', MediaitemSchema);
  return mediaItemModel;
}

export default MediaitemSchema;
