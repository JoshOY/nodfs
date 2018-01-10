import _fs from 'fs';
import fs from 'mz/fs';
import chalk from 'chalk';
import yaml from 'js-yaml';

import FSErrors from './errors';
import Config from './core/config';
import NameNode from './core/namenode';
import prjRoot from './lib/prjroot';
import parseArgs from 'minimist';


async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    await fs.access(prjRoot('config/conf.yaml'), _fs.constants.F_OK);
  } catch (err) {
    throw new FSErrors.ConfigNotFoundError(
      'Configuration file not found. Please check if <project_root>/config/conf.yaml exists.'
    );
  }

  /* Load config */
  Config.loadConfig();
  console.log(chalk.green('Config loaded successfully.'));
  // console.log(Config.config);

  const namenodeInstance = new NameNode();
  await namenodeInstance.init(args['standalone'] || false);
}

main().catch((err) => {
  console.log(chalk.red('[ERROR] ' + err.message));
  console.error(err);
  process.exit(err.errNum || 1);
});
