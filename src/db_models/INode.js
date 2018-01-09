import mongoose from 'mongoose';

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
    permission: Types.String,
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

  return conn.model('INode', iNodeSchema);
};
