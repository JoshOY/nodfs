import MongoDBConnector from '../core/db_connector';
import Config from '../core/config';

import getINodeModel from './INode';
import getGroupModel from './Group';
import getUserModel from './User';
import getDataNodeModel from './DataNode';

Config.loadConfig();
MongoDBConnector.connect(Config.getConfig('mongodb.uri'));
const conn = MongoDBConnector.getConnection();

export default {
  UserModel: getUserModel(conn),
  GroupModel: getGroupModel(conn),
  INodeModel: getINodeModel(conn),
  DataNodeModel: getDataNodeModel(conn),
};
