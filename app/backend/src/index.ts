import 'dotenv/config'

import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { setupSocketHandlers } from './server';

const serverPort = Number(process.env.PORT) || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '* ' } })

app.use(express.json());
app.use(cors());

setupSocketHandlers(io);

app.get('/healthz', (args) => { args.res?.send('OK') });

server.listen(serverPort, '0.0.0.0', () => {
    console.log(`Server is running on port ${serverPort}`);
})
