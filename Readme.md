## Youtube Audio downloader for videos and playlist

![](https://github.com/nxvhm/yt-playlist-downloader2/blob/7ad908545534077a2e68a231b36518c95e57f331/server/public/assets/images/demo.gif)

Currently supports only mp3.

Consist of 3 services: 
- Http server (based on express)
- Queue Service (based on redis and bull queue) which is responsible for download and converting video
- Client service containing UI (react based) for interacting with the server and the queue

### Installation

#### Docker

1. Clone repository              
2. Provide youtube api key in `server/env.example` if you want to download playlists. 
3. Run: ```docker-compose up -d```
4. Start the client:
   ```
   cd ./client
   npm install
   npm start
   ```
5. You should be able to start download videos right away and playlists if yt-apikey provided. All environment variables should be automatically populated in the docker containers from the env.example files.

#### Without docker
```
cd ./server
npm install
cp .env.example .env (Properly edit the file)
npm run start
```

```
cd ./queue
npm install
cp .env.example .env (Properly edit the file)
npm run start
```

```
cd ./client
npm install
cp .env.example .env (Properly edit the file)
npm run start
```
