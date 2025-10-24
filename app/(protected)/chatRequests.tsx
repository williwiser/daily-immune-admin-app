import { api } from "@/data/constants";
import { formatDistanceToNow } from "date-fns";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  createdAt: string;
}

export default function ChatRequests() {
  const [chatRequests, setChatRequests] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    api
      .get("/chat-sessions/pending")
      .then((response) => {
        const users = response.data.map(
          (chatRequest: { user: User; createdAt: Date }) => ({
            ...chatRequest.user,
            createdAt: chatRequest.createdAt,
          })
        );
        console.log(users);
        setChatRequests(users);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const fetchChatRequests = useCallback(() => {
    api.get("/chat-sessions/pending").then((response) => {
      const users = response.data.map(
        (chatRequest: { user: User; createdAt: Date }) => ({
          ...chatRequest.user,
          createdAt: chatRequest.createdAt,
        })
      );
      console.log(users);
      setChatRequests(users);
    });
  }, []);
  useFocusEffect(fetchChatRequests);
  useEffect(() => {
    api.get("/chat-sessions/pending").then((response) => {
      const users = response.data.map(
        (chatRequest: { user: User; createdAt: Date }) => ({
          ...chatRequest.user,
          createdAt: chatRequest.createdAt,
        })
      );
      console.log(users);
      setChatRequests(users);
    });
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Chat Requests" showBackButton />
      <View className="justify-center items-center">
        {chatRequests.length === 0 ? (
          <Text className="text-gray-500">No pending chat requests.</Text>
        ) : (
          <FlatList
            className="w-full"
            data={chatRequests}
            onRefresh={onRefresh}
            refreshing={refreshing}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center gap-4 p-4"
                onPress={() =>
                  router.push({
                    pathname: "/(protected)/confirmRequest",
                    params: {
                      id: item.id,
                      firstName: item.firstName,
                      lastName: item.lastName,
                      profilePhoto: item.profilePhoto,
                    },
                  })
                }
              >
                {item.profilePhoto ? (
                  <Image
                    source={{ uri: item.profilePhoto }}
                    className="size-14 rounded-full"
                  />
                ) : (
                  <View className="inline-flex justify-center items-center size-14 bg-stone-200 rounded-full">
                    <Text className="text-2xl">{item.firstName[0]}</Text>
                  </View>
                )}
                <View>
                  <Text className="text-lg font-semibold leading-5">
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text className="text-gray-500 italic">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
