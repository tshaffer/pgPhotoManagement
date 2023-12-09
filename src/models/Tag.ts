import * as mongoose from 'mongoose';
import { connection } from '../config';

const Schema = mongoose.Schema;

const TagSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true, unique: true },
    type: { type: String, required: true, unique: true },
    avatarType: { type: String, required: true, unique: true },
    avatarId: { type: String, required: true, unique: true },
  }
);

export const getTagModel = () => {
  const tagModel = connection.model('tag', TagSchema);
  return tagModel;
}

export default TagSchema;
