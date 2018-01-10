import express from 'express';
import bodyParser from 'body-parser';
import Config from '../core/config';

import router from './namenode-router';

export default class NameNodeServer {

  constructor() {
    this.app = express();
    // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    this.app.use(bodyParser.json());

    this.app.use('*', (req, res, next) => {
      console.log(`Detect request: [${req.method}] ${req.originalUrl}`);
      next();
    });

    this.app.use('/api', router);
  }

  listen(port) {
    if (typeof port !== 'number') {
      port = Config.getConfig('namenode.webPort');
    }
    this.app.listen(port);
  }
}
