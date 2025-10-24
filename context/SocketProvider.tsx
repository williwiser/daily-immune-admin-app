// SocketContext.tsx
import React, { useEffect, useState, type ReactNode } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";
import useAuth from "./zustand";

interface SocketProviderProps {
  children: ReactNode;
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ENVIRONMENT = process.env.EXPO_PUBLIC_ENV;

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { token } = useAuth();
  console.log("this", token);
  const socket = io(
    ENVIRONMENT === "development" ? "http://192.168.1.21:3000" : API_URL,
    {
      extraHeaders: {
        authorization: token!,
      },
    }
  );

  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  useEffect(() => {
    if (socket) {
      socket.connect();
      socket.on("connect", () => {
        console.log(`✅ Socket connected: ${socket.id}`);
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });

      // socket.on("test", (value) => {
      //   console.log(`Received it!: ${value}`);
      //   alert(`Received it!: ${value}`);
      // });

      socket.on("message", (msg) => {
        console.log("📩 Message received:", msg);
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("test");
        socket.off("message");
      };
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
