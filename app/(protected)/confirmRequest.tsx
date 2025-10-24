import { useSocket } from "@/context/useSocket";
import useAuth from "@/context/zustand";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
};

export default function ConfirmRequest() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { id, firstName, lastName, profilePhoto } =
    useLocalSearchParams<User>();

  useEffect(() => {
    socket.on("chat-started", ({ acceptedBy }) => {
      console.log(`acceptedBy: ${acceptedBy}`);
      console.log(`userId: ${user?.id}`);
      if (acceptedBy === user?.id) {
        router.replace({
          pathname: "/(protected)/user/chat",
          params: {
            id,
            profilePhoto,
            firstName,
            lastName,
            lastChat: "",
          },
        });
        ToastAndroid.show(
          "You are now chatting with this user.",
          ToastAndroid.SHORT
        );
      }
    });

    socket.on("chat-exists", ({ roomId }) => {
      console.log(`chat exists`);
      router.replace({
        pathname: "/(protected)/user/chat",
        params: {
          id,
          profilePhoto,
          firstName,
          lastName,
          lastChat: "",
        },
      });
    });

    return () => {
      socket.off("chat-started");
    };
  }, [socket, user, id, firstName, lastName, profilePhoto]);
  const handleAccept = () => {
    socket.emit("accept-chat", { acceptedUserId: id });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Chat Requests" showBackButton />
      <View className="flex-1 justify-center items-center px-4  py-6 gap-4">
        {profilePhoto ? (
          <Image
            source={{ uri: profilePhoto }}
            className="size-20 rounded-full"
          />
        ) : (
          <View className="inline-flex justify-center items-center size-20 bg-stone-200 rounded-full">
            <Text className="text-2xl">{firstName[0]}</Text>
          </View>
        )}
        <Text className="text-center max-w-sm">
          <Text className="font-bold text-balance">
            {firstName} {lastName}
          </Text>{" "}
          would like to chat. Confirm if you would like to accept this request.
        </Text>

        <View className="gap-4 items-center mt-auto w-full">
          <TouchableOpacity
            className="bg-[#28A745] flex justify-center items-center p-4 rounded-md w-full max-w-sm"
            onPress={handleAccept}
          >
            <Text className="text-white">Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity className="justify-center items-center border border-gray-300 p-4 rounded-md w-full max-w-sm">
            <Text>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
