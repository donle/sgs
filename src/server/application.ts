import { ServerSocket } from 'core/network/socket.server';
import { ServerRoom } from 'core/room/room.server';
import * as http from 'http';
import * as https from 'https';

const socket = new ServerSocket();
const rooms: ServerRoom[] = [];

const server = http.createServer();

class App {
  private rooms: ServerRoom[] = [];
  constructor(private server: http.Server | https.Server) {

  }
}
