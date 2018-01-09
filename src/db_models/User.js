import mongoose from 'mongoose';

const Types = mongoose.Schema.Types;

export default (conn = mongoose) => {
  const userSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, index: { unique: true } },
    name: { type: Types.String, index: { unique: true } },
    password: { type: Types.String },
    group: Types.ObjectId,
    isAdmin: Types.Boolean,
    isRoot: Types.Boolean,
  }, {
    timestamps: true,
    toObject: { virtuals: true },
  });

  return conn.model('User', userSchema);
};
