import express from 'express';

import postDatanodeRegister from './post_datanode_register';
import putDatanodeUpdateInfo from './put_datanode_update_info';
import postUploadFile from './post_upload_file';

const router = express.Router();

router.post('/datanode/register', postDatanodeRegister);
router.put('/datanode/update_info', putDatanodeUpdateInfo);
router.post('/post_upload_file', postUploadFile);

export default router;
