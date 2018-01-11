import _fs from 'fs';
import fs from 'mz/fs';
import chalk from 'chalk';
import yaml from 'js-yaml';

import FSErrors from './errors';
import Config from './core/config';
import DataNode from './core/datanode';
import prjRoot from './lib/prjroot';
import DataNodeServer from './webserver/datanode-server';

async function main() {
  try {
    await fs.access(prjRoot('config/conf.yaml'), _fs.constants.F_OK);
  } catch (err) {
    throw new FSErrors.ConfigNotFoundError(
      'Configuration file not found. Please check if <project_root>/config/conf.yaml exists.'
    );
  }
  const dataNodeServer = new DataNodeServer();

  /* Load config */
  Config.loadConfig();
  console.log(chalk.green('Config loaded successfully.'));
  // console.log(Config.config);

  const dataNodeInstance = new DataNode();
  await dataNodeInstance.init();
  dataNodeServer.listen();
}

main().catch((err) => {
  console.log(chalk.red('[ERROR] ' + err.message));
  console.error(err);
  process.exit(err.errNum || 1);
});
