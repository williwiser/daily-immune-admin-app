import * as FileSystem from "expo-file-system";

export const getRoomFilePath = (roomId: string) =>
  `${FileSystem.documentDirectory}messages_${roomId}.json`;
