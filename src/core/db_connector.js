import mongoose from 'mongoose';

import Singleton from '../lib/singleton';

export default class MongoDBConnector extends Singleton {
  connect(uri) {
    this.conn = mongoose.createConnection(uri, { server: { poolSize: 4 }});
    return this.conn;
  }

  getConnection() {
    return (this.conn || null);
  }
}
