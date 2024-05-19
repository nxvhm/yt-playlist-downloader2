import { createContext } from "react";
import { Socket } from "socket.io-client";

export type SocketContextType = {
    isConnected: boolean,
    connection: Socket | null,
    id: string | undefined
}

const SocketContext = createContext<SocketContextType>({  
    isConnected: false,  
    connection: null,
    id: undefined
});

export default SocketContext;