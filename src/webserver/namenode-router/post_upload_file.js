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
import sleep from '../../lib/sleep';

const INodeModel = Models.INodeModel;
const inspect = util.inspect;

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
 Form fields:
 name
 absPath
 owner
 supergroup
 */

export default function (req, res) {

  console.log({
    headers: req.headers,
    highWaterMark: Config.getConfig('block_size_mb') * 1024 * 1024,
  });
  const busboy = new Busboy({
    headers: req.headers,
    highWaterMark: Config.getConfig('block_size_mb') * 1024 * 1024,
  });
  let formFields = {};
  let allocBlocks = [];
  let transferredLength = 0;
  let remainChunkBytes = 0;
  let tmpBlockBuffer = new Buffer(Config.getConfig('block_size_mb') * 1024 * 1024);
  let bufferPointerPos = 0;
  let blockId = uuid.v4();
  let fieldNameRecord = null;
  let mimeType = '';

  busboy.on('file', (fieldName, file, filename, encoding, mimeTypeStr) => {
    mimeType = mimeTypeStr;
    fieldNameRecord = fieldName;
    console.log('File [' + fieldName + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimeType);
    file.on('data', function (data) {
      // write buffer to a temporary block file
      transferredLength += data.length;
      remainChunkBytes = data.length;
      let i = 0;

      while (true) {
        console.log('Chunk loop start.');
        while ((bufferPointerPos < tmpBlockBuffer.length) && (remainChunkBytes > 0)) {
          tmpBlockBuffer[bufferPointerPos] = data[i];
          i += 1;
          remainChunkBytes -= 1;
          bufferPointerPos += 1;
        }
        // when break
        if (remainChunkBytes > 0) {
          fs.writeFileSync(prjRoot(`./tmp/${blockId}.bin`), tmpBlockBuffer);
          allocBlocks.push(blockId);
          blockId = uuid.v4();
          console.log('File [' + fieldName + '] got ' + tmpBlockBuffer.length + ' bytes, generate block ' + blockId);
          tmpBlockBuffer = new Buffer(Config.getConfig('block_size_mb') * 1024 * 1024);
          bufferPointerPos = 0;
        } else if (remainChunkBytes === 0) {
          i = 0;
          break;
        }
      }
      console.log('Chunk loop end.');
    });
    file.on('end', async function () {
      console.log('File Finished' + fieldName);
    });
  });

  busboy.on('field', (fieldName, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    console.log('Field [' + fieldName + ']: value: ' + inspect(val));
    formFields[fieldName] = val;
  });


  busboy.on('finish', async () => {
    // flush the final block
    while (remainChunkBytes !== 0) {
      console.log('Detect remain chunk bytes, hanging on...');
      sleep(100);
    }
    if (bufferPointerPos !== 0) {
      fs.writeFileSync(prjRoot(`./tmp/${blockId}.bin`), tmpBlockBuffer.slice(0, bufferPointerPos));
      allocBlocks.push(blockId);
      console.log('File [' + fieldNameRecord + '] got ' + bufferPointerPos + ' bytes, generate block ' + blockId);
    }

    await INodeModel.createFileAsync({
      name: formFields.name,
      absPath: formFields.absPath,
      blockSize: Config.getConfig('block_size_mb') * 1024 * 1024,
      permission: 0x640,
      fileSize: transferredLength,
      owner: formFields.owner || '',
      supergroup: formFields.supergroup || '',
      mimeType,
    });

    const storageNodes = selectStorageDataNodes();
    const storageNodeInstances = storageNodes.map((nodeHost) => (new NodeInstance(nodeHost)));
    await Promise.all(storageNodeInstances.map((nodeInst) => {
      for (let idx = 0; idx < allocBlocks.length; idx += 1) {
        nodeInst.commandCreateBlockAsync(
          allocBlocks[idx],
          fs.readFileSync(prjRoot('./tmp/' + allocBlocks[idx] + '.bin'))
        );
      }
      return Promise.resolve();
    }));
    const blocks = allocBlocks.map((blockId, idx) => {
      return {
        blockId,
        blockNodes: storageNodes,
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

  req.pipe(busboy);

};
