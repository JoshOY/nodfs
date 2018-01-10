import express from 'express';
// import upload from './multer_upload';
import busboy_upload from './busboy_upload';
import download_sample from './download_sample';

const router = express.Router();

/*
router.post(
  '/init_namenode',
);
*/

router.post(
  '/upload',
  busboy_upload
);

router.get(
  '/download-sample',
  download_sample
);

export default router;
