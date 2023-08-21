import * as mongoose from 'mongoose';
import { connection } from '../config';

const Schema = mongoose.Schema;

const MediaitemSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },     // album media metadata: id
    fileName: { type: String, required: true },                   // album media metadata: filename
    filePath: { type: String, default: '' },
    baseUrl: { type: String },                                    // album media metadata: baseUrl - not sure what this url is for
    productUrl: { type: String },                                 // album media metadata: productUrl - url of photo at photos.google.com
    mimeType: { type: String },                                   // album media metadata: mimeType
    // mediaMetadata: { type: String, default: '' },              // album media metadata: object with camera information.
    creationTime: { type: String },                               // album media metadata: mediaMetadata.creationTime (string)
                                                                  // or takeout metadata.creationTime (object)
    width: { type: Number },                                      // album media metadata: mediaMetadata.width
    height: { type: Number },                                     // album media metadata: mediaMetadata.height
    orientation: { type: Number, default: 0 },                    // exif - orientation - number
    description: { type: String, default: '' },                   // exif - description - string. others?
    gpsPosition: { type: String, default: '' },                   // exif - gpsPosition - string
    geoData: {                                                    // takeout metadata: geoData
      altitude: { type: Number },
      latitude: { type: Number },
      latitudeSpan: { type: Number },
      longitude: { type: Number },
      longitudeSpan: { type: Number },
    },
    // googlePhotosOrigin: { type: String, default: ''},
    imageViews: { type: Number, default: 0 },                     // takeout metadata: number
    people: [{                                                    // takeout metadata: people
      name: String, default: ''
    }],
    photoTakenTime: {                                             // takeout metadata: photoTakenTime
      formatted: { type: String, default: '' },
      timestamp: { type: String, default: '' },
    },
    title: { type: String, default: '' },                         // takeout metadata: same as filename
    url: { type: String, default: '' },                           // takeout metadata: not sure what it is for.
    // googlePhoto
  }
);

export const getMediaitemModel = () => {
  const mediaItemModel = connection.model('mediaitem', MediaitemSchema);
  return mediaItemModel;
}

export default MediaitemSchema;
