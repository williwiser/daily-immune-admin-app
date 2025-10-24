import * as FileSystem from "expo-file-system";
import { getRoomFilePath } from "./getRoomFilePath";

interface Message {
  id?: string;
  content: string;
  senderId?: string;
  createdAt: Date;
}

export const saveMessagesToFile = async (
  roomId: string,
  messages: Message[]
) => {
  const filePath = getRoomFilePath(roomId);
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(messages));
};
