import express from 'express';
import bodyParser from 'body-parser';

import appRouter from './router';

function main() {
  const app = express();

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  // parse application/json
  app.use(bodyParser.json());

  app.use('/api', appRouter);

  app.use('/', (req, res) => {
    res.end(
      '<!doctype html>' +
      '<html>' +
      '<head>' +
      '<meta charset="utf-8">' +
      '<title>NODFS HTTP Gateway</title>' +
      '</head>' +
      '<body>' +
      '<div>NoDFS web server activated.</div>' +
      '</body>' +
      '</html>'
    );
  });

  app.listen(3000);
  console.log('App listening on port 3000...');
}

main();
