import ChatHeader from "@/app/components/ChatHeader";
import { useSocket } from "@/context/useSocket";
import useAuth from "@/context/zustand";
import { api } from "@/data/constants";
import { getRoomFilePath } from "@/utils/getRoomFilePath";
import { getRoomId } from "@/utils/getRoomId";
import { saveMessagesToFile } from "@/utils/saveMessagesToFile";
import {
  faEllipsisVertical,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { AxiosError } from "axios";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Constants
const MESSAGE_SCROLL_DELAY = 100;
const MAX_MESSAGE_LENGTH = 1000;

interface Message {
  id?: string;
  content: string;
  senderId?: string;
  createdAt: Date;
}

export default function Chat() {
  // Route params
  const {
    id,
    chatId,
    profilePhoto,
    firstName,
    lastName,
  }: {
    id: string;
    chatId: string;
    profilePhoto: string;
    firstName: string;
    lastName: string;
  } = useLocalSearchParams();

  // Hooks
  const { socket } = useSocket();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Memoized values
  const roomId = useMemo(() => getRoomId(user!.id, id), [user, id]);

  const displayName = useMemo(() => {
    const firstNameStr = Array.isArray(firstName) ? firstName[0] : firstName;
    const lastNameStr = Array.isArray(lastName) ? lastName[0] : lastName;
    return `${firstNameStr} ${lastNameStr}`;
  }, [firstName, lastName]);

  const profilePhotoUrl = useMemo(() => {
    return Array.isArray(profilePhoto) ? profilePhoto[0] : profilePhoto;
  }, [profilePhoto]);

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

  // Error handler
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);

    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please log in again.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
        return;
      }
    }

    Alert.alert(
      "Error",
      `Something went wrong while ${context}. Please try again.`,
      [{ text: "OK" }]
    );
  }, []);

  const clearChat = async () => {
    setShowMenu(false);
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to delete all messages? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const filePath = getRoomFilePath(roomId);
              await FileSystem.deleteAsync(filePath, { idempotent: true });
              setMessages([]);
              Alert.alert("Success", "Chat cleared successfully");
            } catch (error) {
              handleError(error, "clearing chat");
            }
          },
        },
      ]
    );
  };

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!roomId || !token) return;

    try {
      await api.post(`/chat-sessions/${roomId}/mark-all-read`, {}, apiConfig);
    } catch (error) {
      // Silent fail for marking as read - not critical
      console.warn("Failed to mark messages as read:", error);
    }
  }, [roomId, token, apiConfig]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    try {
      const filePath = getRoomFilePath(roomId);
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (!fileInfo.exists) {
        setMessages([]);
        console.log(fileInfo);
        return;
      }

      const content = await FileSystem.readAsStringAsync(filePath);
      const parsedMessages = JSON.parse(content).map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }));

      setMessages(parsedMessages);
    } catch (error) {
      handleError(error, "loading messages from file");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, handleError]);

  // Scroll to bottom
  const scrollToBottom = useCallback((animated: boolean = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, MESSAGE_SCROLL_DELAY);
  }, []);

  // Handle receiving messages
  const handleReceiveMessage = useCallback(
    async (socketData: any) => {
      const data = socketData;
      const newMessage: Message = {
        id: data.id,
        content: data.message,
        senderId: data.sender.id,
        createdAt: new Date(),
      };
      console.log("message: ", data.message);
      setMessages((prev) => {
        const updated = [...prev, newMessage];
        // Store messages asynchronously after state update
        saveMessagesToFile(chatId, updated);
        return updated;
      });

      scrollToBottom();
    },
    [scrollToBottom, chatId]
  );

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!user || !messageText.trim() || isSending) return;

    if (messageText.length > MAX_MESSAGE_LENGTH) {
      Alert.alert(
        "Message Too Long",
        `Messages cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
      );
      return;
    }

    const messageToSend: Message = {
      content: messageText.trim(),
      senderId: user.id,
      createdAt: new Date(),
    };

    setIsSending(true);

    try {
      setMessages((prev) => {
        const updated = [...prev, messageToSend];
        // Store messages asynchronously after state update
        saveMessagesToFile(roomId, updated);
        return updated;
      });
      setMessageText("");

      socket.emit("send-message", {
        roomId,
        message: messageToSend.content,
        senderId: user.id,
        recipientId: parseInt(id),
      });

      scrollToBottom();
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1));
      setMessageText(messageToSend.content);
      handleError(error, "sending message");
    } finally {
      setIsSending(false);
    }
  }, [
    user,
    messageText,
    isSending,
    socket,
    roomId,
    id,
    scrollToBottom,
    handleError,
  ]);

  // Input validation
  const isValidInput = useMemo(() => {
    return (
      messageText.trim().length > 0 && messageText.length <= MAX_MESSAGE_LENGTH
    );
  }, [messageText]);

  // Effects
  useEffect(() => {
    if (!user || !token || !id) {
      router.back();
      return;
    }

    markMessagesAsRead();
    fetchMessages();
  }, [user, token, id, markMessagesAsRead, fetchMessages]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("join-room", roomId);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, roomId, handleReceiveMessage]);

  // Render message item
  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isOwnMessage = item.senderId === user?.id;

      return (
        <View
          className={`flex-row mb-3 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          <View
            className={`max-w-[80%] p-3 rounded-2xl ${
              isOwnMessage
                ? "bg-[#3fbe72] rounded-br-md"
                : "bg-white rounded-bl-md"
            }`}
            style={{
              shadowColor: "rgba(0,0,0,0.1)",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text
              className={`text-base leading-5 ${
                isOwnMessage ? "text-white" : "text-gray-900"
              }`}
              selectable
            >
              {item.content}
            </Text>
            <Text
              className={`text-xs text-right mt-1 font-light ${
                isOwnMessage ? "text-green-100" : "text-gray-500"
              }`}
            >
              {item.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      );
    },
    [user?.id]
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-stone-200 justify-center items-center">
        <ActivityIndicator size="large" color="#5aa87aff" />
        <Text className="mt-2 text-gray-600">Loading messages...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-200">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 0}
        >
          <View>
            <ChatHeader
              profilePhoto={profilePhotoUrl}
              name={displayName}
              showBackButton
            />

            {/* Menu Button */}
            <TouchableOpacity
              className="absolute right-4 top-4 p-2 z-10"
              onPress={() => setShowMenu(true)}
            >
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                color="#374151"
                size={20}
              />
            </TouchableOpacity>
          </View>

          {/* Menu Modal */}
          <Modal
            visible={showMenu}
            transparent
            animationType="fade"
            onRequestClose={() => setShowMenu(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
              <View className="flex-1 bg-black/50">
                <TouchableWithoutFeedback>
                  <View className="absolute right-4 top-20 bg-white rounded-lg shadow-lg min-w-[150px]">
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100"
                      onPress={clearChat}
                    >
                      <Text className="text-red-600 font-medium">
                        Clear Chat
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-3"
                      onPress={() => setShowMenu(false)}
                    >
                      <Text className="text-gray-700">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <FlatList
            ref={flatListRef}
            data={messages}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
            keyExtractor={(item, index) => item.id || `message-${index}`}
            onContentSizeChange={() => scrollToBottom(false)}
            onLayout={() => scrollToBottom(false)}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-gray-500 text-center">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />

          <View className="flex-row items-end bg-white border-t border-gray-200 p-4 gap-3">
            <View className="flex-1">
              <TextInput
                className="bg-gray-50 px-4 py-3 border border-gray-200 rounded-2xl text-base max-h-24"
                onChangeText={setMessageText}
                value={messageText}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="center"
                maxLength={MAX_MESSAGE_LENGTH}
                editable={!isSending}
                onSubmitEditing={handleSendMessage}
                blurOnSubmit={false}
              />
              {messageText.length > MAX_MESSAGE_LENGTH * 0.9 && (
                <Text className="text-xs text-gray-500 mt-1 text-right">
                  {messageText.length}/{MAX_MESSAGE_LENGTH}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className={`p-4 rounded-full ${
                isValidInput && !isSending ? "bg-[#3fbe72]" : "bg-gray-300"
              }`}
              onPress={handleSendMessage}
              disabled={!isValidInput || isSending}
              style={{
                shadowColor: isValidInput ? "#3fbe72" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  color={isValidInput ? "white" : "#9CA3AF"}
                  size={16}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
