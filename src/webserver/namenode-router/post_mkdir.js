import INode from "../../db_models/INode";

export default async function post_mkdir(req, res) {
  const dirPath = req.body.dirPath;
  const result = await INode.findOne({
    absPath: dirPath,
  }).exec();
  if (result) {
    return res.json({
      ok: false,
      reason: 'Directory already exists.',
    });
  }
  await INode.createDir(absPath);
  return res.json({
    ok: true,
  });
};
