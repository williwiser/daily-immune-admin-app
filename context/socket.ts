import { Socket } from "socket.io-client";

export interface SocketContextType {
  socket: Socket;
  isConnected: boolean;
}
