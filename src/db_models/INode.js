import mongoose from 'mongoose';
import _ from 'lodash';

const Types = mongoose.Schema.Types;

export default (conn = mongoose) => {
  const iNodeSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, index: { unique: true } },
    name: Types.String,
    absPath: { type: Types.String, index: { unique: true } },
    parentDirectory: Types.ObjectId,
    modificationTime: Types.Date,
    accessTime: Types.Date,
    fileSize: Types.Number,
    blockSize: Types.Number,
    permission: Types.Number,
    owner: Types.String,
    supergroup: Types.String,
    isDirectory: Types.Boolean,
    mimeType: Types.String,
    blocks: [{
      blockId: Types.String,
      blockNodes: [Types.String],
      blockSize: Types.Number,
      offset: Types.Number,
      len: Types.Number,
    }],
    children: [Types.ObjectId],
  }, {
    timestamps: true,
    toObject: { virtuals: true },
  });

  let iNodeModel;

  iNodeSchema.statics.createFileAsync = async (contents) => {
    const newDoc = new iNodeModel(_.assign({}, contents, {
      _id: new mongoose.Types.ObjectId(),
      modificationTime: Date.now(),
      accessTime: Date.now(),
      isDirectory: false,
      blocks: [],
      children: [],
    }));
    return await newDoc.save();
  };

  iNodeSchema.statics.updateINode = async (absPath, updateContent) => {
    const doc = await iNodeModel.findOneAndUpdate(
      { absPath },
      { '$set': updateContent },
    ).exec();
  };

  iNodeModel = conn.model('INode', iNodeSchema);
};
