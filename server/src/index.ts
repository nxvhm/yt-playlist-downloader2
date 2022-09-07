import 'dotenv/config' 
import express from 'express'
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';

import { GetVideoInfo, DownloadVideoFromSelectedFormat } from './controllers/Video'
import { GetPlaylistInfoForm, GetPlaylistContents } from './controllers/Playlist';
const app = express()
const port = process.env.PORT
const httpServer = http.createServer(app)
const wss = new Server(httpServer);
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/playlist', GetPlaylistInfoForm)
app.post('/playlist-info', GetPlaylistContents)

wss.on('connection', (socket) => {  
  console.log('a user connected', socket.id);

  socket.on("disconnect", (reason) => {
    console.log('user disconnected', socket.id, reason);

  });
});


app.post('/get-info', GetVideoInfo)
app.post('/download', DownloadVideoFromSelectedFormat(wss))

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})