import 'dotenv/config'

import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './server';

const serverPort = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '* ' } })

app.use(express.json());
app.use(cors());

setupSocketHandlers(io);

server.listen(serverPort, () => {
    console.log(`Server is running on port ${serverPort}`);
})
