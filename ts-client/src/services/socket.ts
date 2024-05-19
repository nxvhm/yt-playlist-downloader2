import io from "socket.io-client";
const socket = io(import.meta.env.VITE_WSS_URL);
export default socket 
