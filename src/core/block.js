import _fs from 'fs';
import fs from 'fs-extra';
import uuid from 'uuid';

import config from './config';
import prjRoot from '../lib/prjroot';

export default class Block {

  static format(blockId) {
    const blockSize = config.getConfig('block_size_mb') * 1024 * 1024;
    const emptyBuf = new Buffer(blockSize);
    _fs.writeFileSync(prjRoot(`fsdata/${blockId}.bin`), emptyBuf);
  }

  static create() {
    const newBlockId = uuid.v4();
    Block.format(newBlockId);
    return newBlockId;
  }

  static read(blockId, len, offset=0) {
    try {
      const fd = _fs.openSync(prjRoot(`fsdata/${blockId}.bin`), 'r');
      const buf = _fs.readSync(fd);
      const buf_slice = buf.slice(offset, len);
      return buf_slice;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static write(blockId, buf, appendMode=false, position=0, offset=0) {
    const fd = _fs.openSync(prjRoot(`fsdata/${blockId}.bin`), (appendMode ? 'a' : 'w'));
    _fs.writeSync(fd, buf, offset, buf.length, position);
  }

  static remove(blockId) {
    fs.removeSync(prjRoot(`fsdata/${blockId}.bin`));
  }

}
