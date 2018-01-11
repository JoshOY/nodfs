import express from 'express';

import postWriteBlock from './post_write_block';

const router = express.Router();

router.post('/write_block', postWriteBlock, (req, res) => {
  res.json({
    ok: true,
  });
});

export default router;
