export const getRoomId = (userId1: string, userId2: string) => {
  return `chat_${[userId1, userId2].sort().join("_")}`;
};
