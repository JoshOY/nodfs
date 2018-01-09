import mongoose from 'mongoose';

class MongoDBConnector {

  connect(uri) {
    if (this.conn) {
      return this.conn;
    }
    this.conn = mongoose.createConnection(uri, { server: { poolSize: 4 }});
    return this.conn;
  }

  getConnection() {
    return (this.conn || null);
  }

  closeConnection() {
    if (this.conn) {
      this.conn.disconnect();
      this.conn = null;
    }
  }

}

global._DFS_DbManager = global._DFS_DbManager || new MongoDBConnector();

export default global._DFS_DbManager;
