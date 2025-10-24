// Context type
import { createContext } from "react";
import type { SocketContextType } from "./socket";

// Create context
export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);
