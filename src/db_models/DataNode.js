import mongoose from 'mongoose';

const Types = mongoose.Schema.Types;

export default (conn = mongoose) => {
  const userSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, index: { unique: true } },
    nodeId: { type: Types.String, index: { unique: true } },
    url: { type: Types.String },
  }, {
    timestamps: true,
    toObject: { virtuals: true },
  });

  return conn.model('DataNode', userSchema);
};
