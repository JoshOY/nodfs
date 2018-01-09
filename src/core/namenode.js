import os from 'os';
import grpc from 'grpc';
import _ from 'lodash';
import chalk from 'chalk';
import NodeSSH from 'node-ssh';

import DBManager from './db_connector';
import Config from './config';
import Models from '../db_models';

class NameNodeManager {

  constructor() {
    this.dbManager = DBManager;
    this.dataNodesPool = [];
  }

  init() {
    this.dbManager.connect(Config.getConfig('mongodb.uri'));
    // connect data nodes
    const dataNodeHosts = Config.getConfig('namenode.slaves');
    dataNodeHosts.forEach(
      (datanodeHost) => {
        console.log(chalk.cyanBright(`Testing connection to host ${datanodeHost}`));
        return this.testSSHConnection(datanodeHost);
      }
    );
  }

  testSSHConnection = async (targetHost, username, privateKeyLocation) => {
    if (!username) {
      username = os.userInfo().username;
    }
    if (!privateKeyLocation) {
      privateKeyLocation = `/Users/${username}/.ssh/id_rsa`;
    }
    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: targetHost,
        username: username,
        privateKey: privateKeyLocation,
      });
      const result = await ssh.execCommand('echo \"Hello world!\"');
      console.log(chalk.whiteBright(result.stdout));
      await ssh.dispose();
    } catch (err) {
      throw err;
    }
    return true;
  }
}

export default NameNodeManager;

