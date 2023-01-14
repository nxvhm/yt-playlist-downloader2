## Youtube Audio downloader for videos and playlist

Currently supports only mp3.

Consist of 3 services: 
- Http server (based on express)
- Queue Service (based on redis and bull queue) which is responsible for download and converting video
- Client service containing UI (react based) for interacting with the server and the queue