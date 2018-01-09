import fs from 'fs';
import multer from 'multer';
import prjRoot from '../lib/prjroot';


function getDestination (req, file, cb) {
  cb(null, '/dev/null')
}

function MyCustomStorage (opts) {
  this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err)

    let outStream = fs.createWriteStream(path);

    file.stream.pipe(outStream);
    outStream.on('data', (chunk) => {
      console.log('Loading chunk size = ', chunk.length);
    });
    outStream.on('error', cb);
    outStream.on('finish', function () {
      cb(null, {
        path: path,
        size: outStream.bytesWritten,
      })
    })
  })
};

MyCustomStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb)
};

const upload = multer({
  storage: new MyCustomStorage({
    destination: function (req, file, cb) {
      cb(null, prjRoot(`./tmp/${file.filename}`))
    }
  }),
});

export default upload;
