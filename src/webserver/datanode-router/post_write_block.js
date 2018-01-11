import fs from 'fs';
import mongoose from 'mongoose';
import Busboy from 'busboy';
import multer from 'multer';
import util from 'util';
import uuid from 'uuid';

import prjRoot from '../../lib/prjroot';
// import Block from '../../core/block';
// import Config from "../../core/config";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, prjRoot('./fsdata'))
  },
  filename: function (req, file, cb) {
    cb(null, req.body.blockId + '.bin')
  }
});

const upload = multer({ storage });

export default upload.single('blockFile');
