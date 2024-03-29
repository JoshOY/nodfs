import mongoose from 'mongoose';

const Types = mongoose.Schema.Types;

export default (conn = mongoose) => {
  const groupSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, index: { unique: true } },
    groupName: { type: Types.String, index: { unique: true } },
    users: [Types.ObjectId],
  }, {
    timestamps: true,
    toObject: { virtuals: true },
  });

  return conn.model('Group', groupSchema);
};
