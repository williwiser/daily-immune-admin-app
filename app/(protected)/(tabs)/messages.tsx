import Header from "@/app/components/Header";
import { useSocket } from "@/context/useSocket";
import useAuth from "@/context/zustand";
import { api } from "@/data/constants";
import {
  faChevronRight,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { AxiosError } from "axios";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_MESSAGE_PREVIEW_LENGTH = 34;
const MAX_UNREAD_DISPLAY = 9;

// Types
interface User {
  id: string;
  profilePhoto?: string;
  firstName: string;
  lastName: string;
}

interface Message {
  id?: string;
  content: string;
  senderId: string;
  createdAt: Date;
  read: boolean;
}

interface Chat {
  id: string;
  acceptedBy: string;
  createdAt: string;
  latestMessage: string;
  messages: Message[];
  user: User;
  unread?: number;
}

interface ChatRequest {
  fromUserId: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
}

interface SocketMessage {
  roomId: string;
  senderId: string;
  message: string;
}

// Utility functions
const truncateText = (
  text?: string,
  maxLength: number = MAX_MESSAGE_PREVIEW_LENGTH
): string => {
  if (!text) return "";
  const trimmedText = text.trim();
  if (trimmedText.length <= maxLength) return trimmedText;
  return trimmedText.slice(0, maxLength - 1).trim() + "…";
};

const formatUnreadCount = (count: number): string => {
  return count > MAX_UNREAD_DISPLAY
    ? `${MAX_UNREAD_DISPLAY}+`
    : count.toString();
};

export default function Messages() {
  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatRequestsCount, setChatRequestsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Hooks
  const { user, token } = useAuth();
  const { socket } = useSocket();

  // API configuration
  const apiConfig = useMemo(
    () => ({
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    }),
    [token]
  );

  const handleLongPress = () => {
    // Long press → show dropdown
    setDropdownVisible(true);
  };

  const closeDropdown = () => setDropdownVisible(false);

  const handleDeleteChat = useCallback(
    (id: string) => {
      setIsDeleting(true);
      api
        .delete(`/chat-sessions/${id}`, apiConfig)
        .then(async () => {
          ToastAndroid.show("Deleted successfully", ToastAndroid.SHORT);
          setChats((prev) => prev.filter((chat) => chat.id !== id));
          await SecureStore.deleteItemAsync(`messages_${id}`);
        })
        .catch(() => {
          ToastAndroid.show("Error: Could not delete", ToastAndroid.SHORT);
        })
        .finally(() => {
          setIsDeleting(false);
          setDropdownVisible(false);
        });
    },
    [apiConfig]
  );

  // Error handler
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);

    let errorMessage = `Failed to ${context}. Please try again.`;

    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please log in again.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
        return;
      }

      if (error.response?.status === 403) {
        errorMessage = "You don't have permission to access this.";
      } else if (error.response?.status && error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Check your connection.";
      }
    }

    setError(errorMessage);
    Alert.alert("Error", errorMessage, [{ text: "OK" }]);
  }, []);

  // Process chat data
  const processChatsData = useCallback(
    (rawChats: Chat[]): Chat[] => {
      if (!rawChats || !Array.isArray(rawChats)) return [];

      return rawChats.map((chat) => ({
        ...chat,
        messages: (chat.messages || []).map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })),
        unread: (chat.messages || []).filter(
          (message) => message.senderId !== user?.id && !message.read
        ).length,
      }));
    },
    [user?.id]
  );

  // Fetch chats
  const fetchChats = useCallback(
    async (showLoading = true) => {
      if (!token || !user?.id) return;

      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await api.get(`/chat-sessions/admin`, apiConfig);

        const processedChats = processChatsData(response.data.myChatSessions);
        const requestsCount = response.data.myRequestsCount;
        setChats(processedChats);
        setChatRequestsCount(requestsCount);
      } catch (error) {
        handleError(error, "load conversations");
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [token, user?.id, apiConfig, processChatsData, handleError]
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchChats(false);
    setIsRefreshing(false);
  }, [fetchChats]);

  // Handle chat request
  const handleChatRequest = useCallback((requestData: ChatRequest) => {
    console.log(`User ${requestData.fromUserId} wants to chat`);
    setChatRequestsCount((prev) => prev + 1);

    // You could show a toast notification here
    // Toast.show({
    //   type: 'info',
    //   text1: 'New Chat Request',
    //   text2: `${requestData.firstName} ${requestData.lastName} wants to chat`,
    // });
  }, []);

  // Handle receiving message
  const handleReceiveMessage = useCallback(
    (messageData: SocketMessage) => {
      console.log("Message received:", messageData);

      // Update the chat list with new message
      setChats((prev) => {
        if (!prev || !Array.isArray(prev)) return [];

        return prev.map((chat) => {
          const roomId = `chat_${user?.id}_${chat.user.id}`;
          const altRoomId = `chat_${chat.user.id}_${user?.id}`;

          if (
            messageData.roomId === roomId ||
            messageData.roomId === altRoomId
          ) {
            const currentMessages = chat.messages || [];
            const updatedMessages = [
              ...currentMessages,
              {
                id: Date.now().toString(),
                content: messageData.message,
                senderId: messageData.senderId,
                createdAt: new Date(),
                read: false,
              },
            ];

            // Store messages asynchronously after state update
            SecureStore.setItemAsync(
              `messages_${roomId}`,
              JSON.stringify(updatedMessages)
            );

            return {
              ...chat,
              messages: updatedMessages,
              latestMessage: messageData.message,
              unread:
                messageData.senderId !== user?.id
                  ? (chat.unread || 0) + 1
                  : chat.unread || 0,
            };
          }
          return chat;
        });
      });
    },
    [user?.id]
  );

  // Handle chat navigation
  const handleChatPress = useCallback((chat: Chat) => {
    router.push({
      pathname: "/user/chat",
      params: {
        id: chat.user.id,
        chatId: chat.id,
        profilePhoto: chat.user.profilePhoto || "",
        firstName: chat.user.firstName,
        lastName: chat.user.lastName,
        latestMessage: chat.latestMessage,
      },
    });
  }, []);

  // Handle new chat creation
  const handleNewChat = useCallback(() => {
    // For now, just emit test event - replace with actual new chat logic
    router.push("/(protected)/(tabs)/users");
    // You might want to navigate to a user selection screen instead
    // router.push("/users/select");
  }, []);

  // Handle chat requests navigation
  const handleChatRequestsPress = useCallback(() => {
    router.push("/chatRequests");
  }, []);

  // Effects
  useEffect(() => {
    if (!user || !token) {
      router.replace("/login");
      return;
    }

    fetchChats();
  }, [user, token, fetchChats]);

  useFocusEffect(
    useCallback(() => {
      fetchChats(false);
    }, [fetchChats])
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("chat-request", handleChatRequest);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("chat-request", handleChatRequest);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, handleChatRequest, handleReceiveMessage]);

  // Render chat item
  const renderChatItem = useCallback(
    ({ item }: { item: Chat }) => (
      <Pressable
        className="flex-row justify-between items-center p-4 border-b border-gray-100 active:bg-gray-50"
        onPress={() => handleChatPress(item)}
        onLongPress={handleLongPress}
        android_ripple={{ color: "rgba(0,0,0,0.05)" }}
      >
        <View className="flex-row items-center flex-1 gap-3">
          {item.user.profilePhoto ? (
            <Image
              source={{ uri: item.user.profilePhoto }}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <View className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center">
              <Text className="text-xl font-medium text-gray-600">
                {item.user.firstName[0]?.toUpperCase()}
              </Text>
            </View>
          )}

          <View className="flex-1 justify-center">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {item.user.firstName} {item.user.lastName}
            </Text>
            <Text
              className={`text-sm ${
                (item.unread || 0) > 0
                  ? "font-semibold text-gray-900"
                  : "text-gray-500"
              }`}
              numberOfLines={1}
            >
              {truncateText(item.latestMessage)}
            </Text>
          </View>
        </View>

        {(item.unread || 0) > 0 && (
          <View className="bg-[#28A745] rounded-full w-6 h-6 justify-center items-center ml-2">
            <Text className="text-xs text-white font-bold">
              {formatUnreadCount(item.unread || 0)}
            </Text>
          </View>
        )}
        {/* Dropdown (simple modal example) */}
        <Modal
          transparent
          animationType="fade"
          visible={dropdownVisible}
          onRequestClose={closeDropdown}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPressOut={closeDropdown}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 16,
                borderRadius: 8,
                width: 200,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 6,
              }}
            >
              {isDeleting ? (
                <View className="flex-row gap-2 items-center">
                  <ActivityIndicator size="large" color="#28A745" />
                </View>
              ) : (
                <TouchableOpacity className="flex-row gap-2 items-center">
                  <FontAwesomeIcon icon={faTrash} />

                  <Text
                    style={{ paddingVertical: 15 }}
                    onPress={() => handleDeleteChat(item.id)}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </Pressable>
    ),
    [dropdownVisible, handleChatPress, handleDeleteChat, isDeleting]
  );

  // Empty state component
  const EmptyState = useCallback(
    () => (
      <View className="flex-1 justify-center items-center px-6 py-12">
        <View className="w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-4">
          <FontAwesomeIcon icon={faPlus} size={32} color="#9CA3AF" />
        </View>
        <Text className="text-lg font-medium text-gray-900 mb-2 text-center">
          No conversations yet
        </Text>
        <Text className="text-gray-500 text-center leading-5">
          Tap the + button to start your first conversation
        </Text>
      </View>
    ),
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#28A745" />
        <Text className="mt-4 text-gray-600">Loading conversations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Messages" rightComponent="profile" />

      {/* Chat Requests Banner */}
      <TouchableOpacity
        className="px-4 py-3 flex-row justify-between items-center bg-gray-50 border-b border-gray-100"
        onPress={handleChatRequestsPress}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <Text className="text-base font-medium text-[#28A745]">
            Chat Requests
          </Text>
          {chatRequestsCount > 0 && (
            <View className="ml-2 bg-red-500 rounded-full px-2 py-1 min-w-[20px] items-center">
              <Text className="text-xs text-white font-bold">
                {formatUnreadCount(chatRequestsCount)}
              </Text>
            </View>
          )}
        </View>
        <FontAwesomeIcon icon={faChevronRight} color="#28A745" size={16} />
      </TouchableOpacity>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.user.id}
        renderItem={renderChatItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#28A745"]}
            tintColor="#28A745"
          />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 82, // Approximate height of each item
          offset: 82 * index,
          index,
        })}
      />

      {/* Floating Action Button */}
      <FAB
        icon={<FontAwesomeIcon icon={faPlus} color="white" size={18} />}
        placement="right"
        size="large"
        color="#28A745"
        onPress={handleNewChat}
        buttonStyle={{
          shadowColor: "#28A745",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      />
    </SafeAreaView>
  );
}
