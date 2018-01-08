import _fs from 'fs';
import fs from 'mz/fs';
import chalk from 'chalk';
import yaml from 'js-yaml';

import FSErrors from './errors';
import prjRoot from './lib/prjroot';

async function main() {
  try {
    await fs.access(prjRoot('config/conf.yaml'), _fs.constants.F_OK);
  } catch (err) {
    throw new FSErrors.ConfigNotFoundError(
      'Configuration file not found. Please check if <project_root>/config/conf.yaml exists.'
    );
  }
}

main().catch((err) => {
  console.log(chalk.red('[ERROR] ' + err.message));
  console.error(err);
  process.exit(err.errNum || 1);
});
