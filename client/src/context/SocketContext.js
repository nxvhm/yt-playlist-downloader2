import { createContext } from "react";

const SocketContext = createContext({  
    isConnected: false,  
    connection: null,
    id: null
});

export default SocketContext;