import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Testimony {
  id: string;
  title: string;
  thumbnail: string;
  updatedAt: Date;
  user: User;
}

export default function Feed() {
  const [feedItems, setFeedItems] = useState<Testimony[]>([]);

  useEffect(() => {
    axios
      .get(
        "https://daily-immune.ew.r.appspot.com/api/v1/testimonies?page=1&limit=20"
      )
      .then((response) => setFeedItems(response.data));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Feed" rightComponent="mainMenu" />
      <View className="px-4 py-6">
        <Text className="text-2xl font-semibold mb-4">Recent Activity</Text>
        <FlatList
          data={feedItems}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-4 rounded-md border border-gray-200 mb-4"
              onPress={() =>
                router.push({
                  pathname: "/(protected)/testimony/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View className="flex justify-between gap-4 flex-row">
                <View>
                  <Text className="max-w-[16rem]">
                    <Text className="font-semibold">
                      {item.user.firstName} {item.user.lastName}
                    </Text>{" "}
                    uploaded a testimony titled{" "}
                    <Text className="italic">{item.title}</Text>
                  </Text>
                  <Text className="max-w-[16rem] mt-auto text-gray-500">
                    {formatDistanceToNow(new Date(item.updatedAt), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
                <Image
                  source={
                    item.thumbnail
                      ? { uri: item.thumbnail }
                      : require("../../../assets/images/placeholder.jpg")
                  }
                  resizeMode="cover"
                  className="size-24 rounded-md"
                />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
