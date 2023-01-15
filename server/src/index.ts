import 'dotenv/config' 
import express, {Request, Response} from 'express'
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';
import * as VideoController from './controllers/Video'
import * as PlaylistItemsController from './controllers/Playlist/Items';
import * as PlaylistDownloadController from './controllers/Playlist/Download';
import Messagenger from './Helpers/Messanger';

const app = express()
const port = process.env.PORT
app.use(cors());
const httpServer = http.createServer(app)
const wss = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

wss.on('connection', (socket) => {  

  console.log(
    'User connected', socket.id, 
    'Total connections:', wss.sockets.server.engine.clientsCount
  );

  socket.on("disconnect", (reason) => {
    console.log('user disconnected', socket.id, reason);

  });

  /**
   * Message from the queue worker informing the server 
   * for download progress for specific video id and client
   */
  socket.on("dl-progress", data => {
    Messagenger.downloadProgressMessageHandler(socket, data)
  });

  /**
   * Message from the queue worker informing the server 
   * for download progress for specific video id and client
   */
  socket.on("convertion-progress", data => {
    Messagenger.convertionProgressMessageHandler(socket, data)
  })

});

app.post(
  '/playlist', 
  PlaylistItemsController.getItemsValidator,
  PlaylistItemsController.getItems
);

app.post(
  '/playlist/download-items',
  PlaylistDownloadController.downloadItems,
);

app.post('/get-info', 
  VideoController.VideoRequestValidator,
  VideoController.GetVideoInfo,
)

app.post('/download-mp3', 
  VideoController.VideoRequestValidator,
  VideoController.DownloadMP3Audio(wss),
)

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})