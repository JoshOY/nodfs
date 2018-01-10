import Models from '../../db_models';

const DataNodeModel = Models.DataNodeModel;

export default async function (req, res) {
  console.log('Received request for registering datanode.');
  console.log(req.body);
  const { nodeId, nodeHostName } = req.body;
  await DataNodeModel.registerDataNode(nodeId, nodeHostName);
  return res.json({
    ok: true,
  });
};
