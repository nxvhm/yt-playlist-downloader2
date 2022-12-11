import 'dotenv/config' 
import express, {Request, Response} from 'express'
import { Server } from "socket.io";
import http from 'http';
import cors from 'cors';
import { getRedisClient } from './Services/Redis';
import { GetVideoInfo, DownloadVideoFromSelectedFormat, DownloadMP3Audio } from './controllers/Video'
import * as PlaylistCtrl from './controllers/Playlist';
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

app.post(
  '/playlist', 
  PlaylistCtrl.getPlaylistItemsRequestValidator,
  PlaylistCtrl.getPlaylistItems
);

wss.on('connection', (socket) => {  
  console.log('a user connected', socket.id);

  socket.on("disconnect", (reason) => {
    console.log('user disconnected', socket.id, reason);

  });
});

app.get('/', async (req: Request, res: Response) => {
  const client = await getRedisClient()
  // client.on('error', (err) => console.log('Redis Client Error', err));
  // await client.connect();

  await client.set('key', 'valu12121e');
  const value = await client.get('key');  
  res.send('Hello World! '+value);
})
app.post('/get-info', GetVideoInfo)
app.post('/download-mp3', DownloadMP3Audio(wss))

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})