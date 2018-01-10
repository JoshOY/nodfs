import Models from '../../db_models';

const DataNodeModel = Models.DataNodeModel;

export default async function (req, res) {
  const nodeId = req.body.nodeId;
  await DataNodeModel.findOneAndUpdate(
    { nodeId, },
    {
      info: req.body.info,
    },
  ).exec();
  return res.json({
    ok: true,
  });
};
