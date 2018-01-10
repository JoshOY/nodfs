import express from 'express';

import postDatanodeRegister from './post_datanode_register';
import putDatanodeUpdateInfo from './put_datanode_update_info';

const router = express.Router();

router.post('/datanode/register', postDatanodeRegister);
router.put('/datanode/update_info', putDatanodeUpdateInfo);

export default router;
