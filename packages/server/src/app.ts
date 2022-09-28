import http from 'http';
import express, {Response, NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv'
dotenv.config();

import init from './init';
init()

import { CustomeRequest } from './CustomRequest';
import router from './routers';

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);
server.listen(PORT, () =>
  console.log(`Server run at http://localhost:${PORT}`)
);

export const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

io.on('connection', (socket: Socket) => {
  console.log(socket.id);
});

export const songStatus: {
  currentTime: string;
  currentSong: string;
} = {
  currentTime:'', 
  currentSong: ''
};

app.use((req: CustomeRequest, res: Response, next: NextFunction) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  console.log(songStatus);
  next();
});
app.use(router);
app.use((req, res) => {
  res.send(404);
});
