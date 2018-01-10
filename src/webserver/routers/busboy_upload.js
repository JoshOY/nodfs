import Busboy from 'busboy';
import util from 'util';

const inspect = util.inspect;

export default function (req, res) {
  const busboy = new Busboy({
    headers: req.headers,
    highWaterMark: 10 * 1024 * 1024,
  });
  busboy.on('file', (fieldName, file, filename, encoding, mimeType) => {
    console.log('File [' + fieldName + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimeType);
    file.on('data', function(data) {
      console.log('File [' + fieldName + '] got ' + data.length + ' bytes');
    });
    file.on('end', function() {
      console.log('File [' + fieldName + '] Finished');
    });
  });
  busboy.on('field', (fieldName, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    console.log('Field [' + fieldName + ']: value: ' + inspect(val));
  });
  busboy.on('finish', () => {
    console.log('Done parsing form!');
    res.json({ ok: true });
  });
  req.pipe(busboy);
};
