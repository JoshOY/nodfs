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
    Promise.all(dataNodeHosts.map(
      (datanodeHost) => {
        console.log(chalk.cyanBright(`Testing connection to host ${datanodeHost}`));
        return this.testSSHConnection(datanodeHost);
      }
    ))
    .then((nodesStatus) => {
      const connPromises = [];
      nodesStatus.map((ok, idx) => {
        if (ok) {
          connPromises.push(this.startDataNode(dataNodeHosts[idx]));
          // if data node connectivity is ok, then add SSH session to connection pool
          this.dataNodesPool.push(dataNodeHosts);
        }
      });
      return Promise.all(connPromises);
    })
    .then(() => {
      // Start gRPC server
    });
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
      const result = await ssh.execCommand(`echo \"Connect to ${targetHost} success.\"`);
      console.log(chalk.whiteBright(result.stdout));
      await ssh.dispose();
    } catch (err) {
      // console.error(err);
      console.log(chalk.red(`Connect to ${targetHost} failed!`));
      return false;
    }
    return true;
  };

  startDataNode = async (targetHost, username, privateKeyLocation, activate_zsh=true) => {
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
      const result = await ssh.execCommand(
        (activate_zsh ? `source ~/.zshrc && ` : '') +
        `cd $NODFS_HOME && forever start -c "npm run lab" .`
      );
      console.log(chalk.whiteBright(result.stdout));
      console.log(chalk.red(result.stderr));
      await ssh.dispose();
    } catch (err) {
      // console.error(err);
      console.log(chalk.red(`Connect to ${targetHost} failed!`));
      return false;
    }
    return true;
  };
}

export default NameNodeManager;

