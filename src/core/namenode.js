import os from 'os';
import grpc from 'grpc';
import _ from 'lodash';
import chalk from 'chalk';
import NodeSSH from 'node-ssh';

import DBManager from './db_connector';
import Config from './config';
import Models from '../db_models';
import DataNodeModel from '../db_models/DataNode';
import RPCServer from '../webserver/namenode-server';
import prjRoot from "../lib/prjroot";

class NameNodeManager {

  constructor() {
    this.dbManager = DBManager;
    this.dataNodesPool = [];
    this.rpcServer = null;
  }

  async init(standalone) {
    console.log('Connectiong mongodb: ' + Config.getConfig('mongodb.uri'));
    this.dbManager.connect(Config.getConfig('mongodb.uri'));
    // connect data nodes
    const dataNodeHosts = Config.getConfig('namenode.slaves');
    // Start gRPC server
    this.rpcServer = new RPCServer();
    this.rpcServer.listen();

    if (!standalone) {
      Promise.all(dataNodeHosts.map(
        (datanodeHost) => {
          console.log(chalk.cyanBright(`Testing connection to host ${datanodeHost}`));
          return this.testSSHConnection(datanodeHost);
        }
      ))
        .then(async (nodesStatus) => {
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
          // todo
        });
    }
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
        `cd $NODFS_HOME && ` +
        `forever start ` +
        `-l ${prjRoot('./logs')}/${(new Date()).toString().replace(/\s/g, '_').replace(/\:/g, '_') + '.log'} ` +
        `-c "npm run start-datanode -- ` +
        `--nodeHostName=${targetHost}" . `
      );
      console.log(chalk.whiteBright(result.stdout));
      console.log(chalk.red(result.stderr));
      // await DataNodeModel.registerDataNode('', targetHost);
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

