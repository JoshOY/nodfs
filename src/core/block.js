/**
 * NOHDFS block definition
 */

import fs from 'mz/fs';
import rootPath from '../lib/resolve_root';

/**
 * Block design:
 * A block contains file binaries data and mount on host file system as a standalone file.
 *
 */
export default class FSBlock {

  /**
   * Create a NoHDFS block
   * @param path - Path of the new block
   * @param blockSize - default 134217728 = 128 * 1024 * 1024 (128 MB)
   */
  static async create(blockId, blockSize=134217728) {
    const path = rootPath('./fsdata/' + blockId + '.block.data');
    const buf = new Buffer(blockSize);
    return fs.writeFile(path, buf);
  }

  constructor(data, options) {
    if (typeof options === 'undefined') {
      options = {};
    }
    /* Block size: default 128 KB */
    this.blockSize = options.blockSize || 128 * 1024 * 1024;
    this.buffer = options.buffer || (new Buffer(this.blockSize));
  }

}
