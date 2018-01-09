import _fs from 'fs';
import yaml from 'js-yaml';
import _ from 'lodash';

import prjRoot from '../lib/prjroot';
import Singleton from '../lib/singleton';

class ConfigManager {

  constructor() {
    this.config = {};
  }

  loadConfig(configPath) {
    if (typeof configPath === 'undefined') {
      configPath = prjRoot('config/conf.yaml');
    }
    this.config = yaml.safeLoad(_fs.readFileSync(configPath, 'utf-8'));
    return this;
  }

  setConfig(item, val) {
    _.set(this.config, item, val);
    return this;
  }

  getConfig(item) {
    return _.get(this.config, item, undefined);
  }

}

global._DFS_Config = global._DFS_Config || new ConfigManager();

export default global._DFS_Config;
