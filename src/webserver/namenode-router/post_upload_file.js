import fs from 'fs';
import mongoose from 'mongoose';
import Busboy from 'busboy';
import util from 'util';
import uuid from 'uuid';

import prjRoot from '../../lib/prjroot';
import Models from '../../db_models';
import Config from '../../core/config';
import getRandom from '../../lib/get_random_from_array';
import NodeInstance from '../../core/node_instance';

const INodeModel = Models.INodeModel;

function selectStorageDataNodes() {
  const replicationNum = Config.getConfig('datanode.replicates');
  const slaves = Config.getConfig('namenode.slaves');
  if (slaves.length <= replicationNum) {
    return slaves;
  }
  // else
  return getRandom(slaves, replicationNum);
}

/**
  Form format:
 name

 */

export default async function (req, res) {
  const busboy = new Busboy({
    headers: req.headers,
    highWaterMark: Config.getConfig('block_size_mb') * 1024 * 1024,
  });
  let formFields = {};
  let allocBlocks = [];
  busboy.on('file', (fieldName, file, filename, encoding, mimeType) => {
    console.log('File [' + fieldName + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimeType);
    let transferredLength = 0;
    file.on('data', function (data) {
      const blockId = uuid.v4();
      allocBlocks.push(blockId);
      // write buffer to a temporary block file
      transferredLength += data.length;
      fs.writeFileSync(prjRoot(`./tmp/${blockId}.bin`), data);
      console.log('File [' + fieldName + '] got ' + data.length + ' bytes, generate block ' + blockId);
    });
    file.on('end', async function () {
      console.log('File [' + fieldName + '] Finished');
      await INodeModel.createFileAsync({
        name: formFields.name,
        absPath: formFields.absPath,
        blockSize: Config.getConfig('block_size_mb') * 1024 * 1024,
        permission: 0x640,
        fileSize: transferredLength,
        owner: formFields.owner,
        supergroup: formFields.supergroup,
        mimeType,
      });
    });
    busboy.on('field', (fieldName, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      console.log('Field [' + fieldName + ']: value: ' + inspect(val));
      formFields[fieldName] = val;
    });
    busboy.on('finish', async () => {
      const storageNodes = selectStorageDataNodes();
      const storageNodeInstances = storageNodes.map((nodeHost) => (new NodeInstance(nodeHost)));
      await Promise.all(storageNodeInstances.map((nodeInst, idx) => {
        return nodeInst.commandCreateBlockAsync(
          allocBlocks[idx],
          fs.readFileSync(prjRoot('./tmp/' + allocBlocks[idx] + '.bin'))
        );
      }));
      const blocks = allocBlocks.map((blockId, idx) => {
        return {
          blockId,
          blockNodes: [],
          blockSize: Config.getConfig('block_size_mb') * 1024 * 1024,
          offset: 0,
          len: Config.getConfig('block_size_mb') * 1024 * 1024,
        };
      });
      await INodeModel.updateINode(formFields.absPath, {
        blocks,
      });
      console.log('Done parsing form!');
      res.json({ ok: true });
    });
  });
};