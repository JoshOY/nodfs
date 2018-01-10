import mongoose from 'mongoose';

const Types = mongoose.Schema.Types;
const ObjectId = mongoose.Types.ObjectId;

export default (conn = mongoose) => {
  const dataNodeSchema = new mongoose.Schema({
    _id: { type: Types.ObjectId, index: { unique: true } },
    nodeId: { type: Types.String, index: { unique: true } },
    nodeHostName: { type: Types.String },
    info: { type: Types.Mixed },
  }, {
    timestamps: true,
    toObject: { virtuals: true },
  });

  let DataNodeModel;

  dataNodeSchema.statics.registerDataNode = async function (nodeId, nodeHostName) {
    console.log('Registering data node to db...');
    const queryResult = await DataNodeModel.findOne({
      nodeId,
    }).exec();
    console.log('queryResult =', queryResult);
    if (queryResult) {
      return queryResult;
    }
    const newDataNode = new DataNodeModel({
      _id: new ObjectId(),
      nodeId,
      nodeHostName,
      info: null,
    });
    return await newDataNode.save();
  };

  DataNodeModel = conn.model('DataNode', dataNodeSchema);

  return DataNodeModel;
};
