import fs from 'fs';
import fse from 'fs-extra';
import fsp from 'mz/fs';
import _ from 'lodash';
import chalk from 'chalk';
import uuid from 'uuid';
import parseArgs from 'minimist';
import SI from 'systeminformation';
import request from 'request';
import requestPromise from 'request-promise';

import Config from './config';
import prjRoot from '../lib/prjroot';


const REG_FILE_PATH = prjRoot('./config/node_info.json');

export default class DataNode {
  constructor() {
    this.bindPort = null;
    this.nodeId = null;
    this.masterHost = '';
    this.nodeHostName = 'localhost';
    this.updateIntervalId = null;
  }

  async init() {
    const args = parseArgs(process.argv.slice(2));
    // check if data node has already initialized
    const registerIdFileExists = await fse.pathExists(REG_FILE_PATH);
    if (!registerIdFileExists) {
      // if not initialized, generate an ID as token
      const newId = uuid.v4();
      this.nodeId = newId;
      this.masterHost = Config.getConfig('namenode.host');
      this.nodeHostName = args['nodeHostName'] || this.nodeHostName;
      await fsp.writeFile(REG_FILE_PATH, JSON.stringify({
        node_id: newId,
        node_host_name: this.nodeHostName,
        master_host: this.masterHost,
      }));
    } else {
      const storedConfig = JSON.parse(fs.readFileSync(REG_FILE_PATH, 'utf-8').toString());
      this.nodeId = storedConfig.node_id;
      this.masterHost = storedConfig.master_host;
      this.nodeHostName = storedConfig.node_host_name;
    }
    console.log('Waiting namenode for register request. ' + `http://${this.masterHost}:30000/api/datanode/register`);
    let res = await requestPromise({
      method: 'POST',
      uri: `http://${this.masterHost}:30000/api/datanode/register`,
      json: {
        nodeId: this.nodeId,
        nodeHostName: this.nodeHostName,
      },
    });
    if (res.ok) {
      console.log(chalk.green(`Datanode "${this.nodeHostName}" register complete.`));
    }
    // post update info to master node
    this.updateIntervalId = setInterval(async () => {
      const sysInfo = {
        cpu: await SI.cpu(),
        memory: await SI.mem(),
        fs_size: await SI.fsSize(),
      };
      await requestPromise({
        method: 'PUT',
        uri: `http://${this.masterHost}:30000/api/datanode/update_info`,
        json: {
          nodeId: this.nodeId,
          info: sysInfo,
        },
      });
    }, 5000);
  }

  shutdown() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  }
}
