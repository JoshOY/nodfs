import fs from 'fs';
import mongoose from 'mongoose';
import Busboy from 'busboy';
import util from 'util';
import uuid from 'uuid';

import prjRoot from '../../lib/prjroot';
import Models from '../../db_models';
import Config from '../../core/config';

const INodeModel = Models.INodeModel;

const inspect = util.inspect;

export default function (req, res) {
  const busboy = new Busboy({
    headers: req.headers,
    highWaterMark: 10 * 1024 * 1024,
  });
  busboy.on('file', (fieldName, file, filename, encoding, mimeType) => {
    console.log('File [' + fieldName + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimeType);
    let transferredLength = 0;
    file.on('data', function(data) {
      const blockId = uuid.v4();
      // write buffer to a temporary block file
      transferredLength += data.length;
      fs.writeFileSync(prjRoot(`./tmp/${blockId}.bin`), data);
      console.log('File [' + fieldName + '] got ' + data.length + ' bytes');
    });
    file.on('end', function() {
      console.log('File [' + fieldName + '] Finished');
      const ib = new INodeModel({
        _id: new mongoose.Types.ObjectId(),
        name: filename,
        absPath: '',
        parentDirectory: '',
        modificationTime: Date.now(),
        accessTime: Date.now(),
        blockSize: 10 * 1024 * 1024,
      });
    });
  });
  busboy.on('field', (fieldName, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    console.log('Field [' + fieldName + ']: value: ' + inspect(val));
  });
  busboy.on('finish', () => {
    console.log('Done parsing form!');
    res.json({ ok: true });
  });
  req.pipe(busboy);
};
