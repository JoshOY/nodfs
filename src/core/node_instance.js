import _ from 'lodash';
import requestPromise from 'request-promise';
import Config from './config';

export default class NodeInstance {

  constructor(nodeHost) {
    this.nodeHost = nodeHost;
  }

  commandCreateBlockAsync = async (blockId, buffer) => {
    // const form = req.form();
    return await requestPromise({
      method: 'POST',
      uri: `http://${this.nodeHost}:30002/api/write_block`,
      formData: {
        blockId: blockId,
        blockFile: {
          value: buffer,
          options: {
            filename: blockId,
          },
        },
      },
    });
  };
}