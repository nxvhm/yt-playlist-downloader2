import { io, Socket } from "socket.io-client";

class SocketClient {

    private static client: Socket;

    static initConnection() {
        SocketClient.client = io("ws://ytdownloader:3005", {
            reconnectionDelayMax: 10000,
            // Example auth credentials
            auth: {name: "ytdl-queue-worker"},
            autoConnect: true,
            multiplex: true
        });
    }

    public static getClient() {
        
        if (!SocketClient.client) {
            SocketClient.initConnection();
        }

        return SocketClient.client;
    }
}

export default SocketClient;