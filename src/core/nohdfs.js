/**
 * NOHDFS class definitions.
 * Created by JoshOY on 2018.01.06
 */

import _ from 'lodash';

import * as FSErrors from './errors';
import resolve_root from '../lib/resolve_root';

export default class FS {

  /* permissions flags */
  static F_OK = 0;
  static R_OK = 4;
  static W_OK = 2;
  static X_OK = 1;

  /**
   * NoHDFS constructor
   * Create a NoHDFS instance and run
   * @param options
   */
  constructor(options = {}) {
    if (_.isObject(options) === false) {
      console.error('[ERROR] NoHDFS options parameter should be an object.');
      throw new FSErrors.FSInitializeError();
    }
    this.fsdataPath = options.fsDataPath || resolve_root('./fsdata');
  }

}
