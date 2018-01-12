import express from 'express';

import postDatanodeRegister from './post_datanode_register';
import putDatanodeUpdateInfo from './put_datanode_update_info';
import postUploadFile from './post_upload_file';
import getDirectory from './get_directory';
import getDownloadFile from './get_download_file';
import postMkDir from './post_mkdir';

const router = express.Router();

router.post('/datanode/register', postDatanodeRegister);
router.put('/datanode/update_info', putDatanodeUpdateInfo);
router.post('/upload', postUploadFile);
router.get('/directory', getDirectory);
router.get('/download', getDownloadFile);
router.post('/mkdir', postMkDir);

export default router;
