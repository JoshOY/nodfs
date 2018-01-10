/**
 * An example of reading stream bytes from split data blocks,
 * piping them to response a download request
 */

import fs from 'fs';
import prjRoot from '../../lib/prjroot';

function writeStreamToRes(rs, res) {
  return new Promise((resolve, reject) => {
    rs.on('data', (chunk) => {
      res.write(chunk);
      res.flush();
    });
    rs.on('end', () => {
      resolve();
    });
    rs.on('error', (err) => {
      reject(err);
    });
  });
}

export default async function (req, res) {
  const fStreams = [];
  res.setHeader('Content-type', 'application/tar');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-disposition', 'attachment; filename=big_file.tar');

  for (let i = 0; i < 5; ++i) {
    let s = fs.createReadStream(prjRoot(`src/webserver/routes/example_files/test_big_file.tar.part${i}`));
    fStreams.push(s);
  }

  res.statusCode = 200;

  for (let i = 0; i < 5; ++i) {
    let rs = fStreams[i];
    await writeStreamToRes(rs, res);
  }

  res.end();
};
