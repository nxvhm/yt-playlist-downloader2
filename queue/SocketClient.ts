import { io, Socket } from "socket.io-client";
import 'dotenv/config' 

class SocketClient {

    private static client: Socket;

    static initConnection() {
        SocketClient.client = io(process.env.WS_ADDR, {
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