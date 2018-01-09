import _ from 'lodash';
import http from 'http';
import SocketIOServer from 'socket.io';


class SocketService {

  constructor() {
    this.io = null;
    this.server = null;
  }

  init() {
    this.io = new SocketIOServer();
    this.server = http.Server();
  }
}
