import useAuth from "@/context/zustand";
import { api } from "@/data/constants";
import { faCalendar, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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

interface FeedItem {
  id: string;
  type: string;
  content: string;
  authorName: string;
  createdAt: Date;
  thumbnail?: string;
  extra?: {
    status?: string;
  };
}

export default function Feed() {
  const { token } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const tabBarHeight = useBottomTabBarHeight();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    const config = {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    };
    // 👇 Put your data reloading logic here
    api.get("/feed/admin?page=1&limit=30", config).then((response) => {
      setFeedItems(response.data);
    });
    setRefreshing(false);
  };

  console.log(tabBarHeight);

  useEffect(() => {
    const config = {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    };
    api.get("/feed/admin?page=1&limit=30", config).then((response) => {
      setFeedItems(response.data);
    });
  }, [token]);

  const renderStatus = (status: string | undefined) => {
    switch (status) {
      case "published":
        return (
          <Text className="uppercase text-sm text-white bg-green-500 py-1 px-4 rounded-md ">
            {status}
          </Text>
        );
      case "pending":
        return (
          <Text className="uppercase text-sm text-white bg-stone-500 py-1 px-4 rounded-md ">
            {status}
          </Text>
        );
      case "blocked":
        return (
          <Text className="uppercase text-sm text-white bg-red-500 py-1 px-4 rounded-md ">
            {status}
          </Text>
        );
      default:
        return null;
    }
  };

  const renderActivity = (item: FeedItem) => {
    switch (item.type) {
      case "testimony":
        return (
          <TouchableOpacity
            className="px-4 py-6 border-b border-gray-200 mb-4"
            onPress={() =>
              router.push({
                pathname: "/(protected)/testimony/[id]",
                params: { id: item.id.split("-")[1] },
              })
            }
          >
            <View className="flex justify-between gap-4">
              <View>
                <Text className="max-w-[16rem] mb-2 text-gray-500">
                  <Text className="font-semibold">{item.authorName}</Text>{" "}
                  uploaded a testimony{" "}
                </Text>
                <Text className="text-3xl font-semibold">{item.content}</Text>
                <View className="flex-row my-1">
                  {renderStatus(item.extra?.status)}
                </View>
                <Text className="max-w-[16rem] mt-auto text-gray-500">
                  {formatDistanceToNow(new Date(item.createdAt), {
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
                className="h-44 w-full rounded-md"
              />
            </View>
          </TouchableOpacity>
        );
      case "prayerRequest":
        return (
          <TouchableOpacity
            className="p-4 border-b border-gray-200 mb-4"
            onPress={() =>
              router.push({
                pathname: "/(protected)/testimony/[id]",
                params: { id: item.id.split("-")[1] },
              })
            }
          >
            <View className="flex justify-between gap-4 flex-row">
              <View>
                <Text className="max-w-[16rem] text-gray-500">
                  <Text className="font-semibold">{item.authorName}</Text>{" "}
                  submitted a prayer request{" "}
                  <Text className="italic">{item.content}</Text>
                </Text>

                <Text className="max-w-[16rem] mt-auto text-gray-500">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </Text>
              </View>

              <View className="flex justify-center items-center size-24 bg-stone-200 rounded-md">
                <FontAwesomeIcon icon={faHeart} size={25} color="#57534e" />
              </View>
            </View>
          </TouchableOpacity>
        );
      case "event":
        return (
          <TouchableOpacity
            className="p-4 border-b border-gray-200 mb-4"
            onPress={() =>
              router.push({
                pathname: "/(protected)/testimony/[id]",
                params: { id: item.id.split("-")[1] },
              })
            }
          >
            <View className="flex justify-between gap-4 flex-row">
              <View>
                <Text className="max-w-[16rem] text-gray-500">
                  <Text className="font-semibold">{item.authorName}</Text> is
                  hosting an event{" "}
                  <Text className="italic">{item.content}</Text>
                </Text>

                <Text className="max-w-[16rem] mt-auto text-gray-500">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </Text>
              </View>

              <View className="flex justify-center items-center size-24 bg-stone-200 rounded-md">
                <FontAwesomeIcon icon={faCalendar} size={25} color="#57534e" />
              </View>
            </View>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-6" edges={["bottom"]}>
      <Header title="Feed" rightComponent="profile" />
      <View
        className="px-4 py-6 h-screen"
        style={{ paddingBottom: tabBarHeight }}
      >
        <Text className="text-2xl font-semibold mb-4">Recent Activity</Text>
        {feedItems.length === 0 ? (
          <View className="p-9">
            <Text className="font-bold mb-3 text-center text-gray-500">
              No items in your feed
            </Text>
            <Text className="text-center text-gray-500">
              New posts will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={feedItems}
            keyExtractor={(item) => item.id}
            onRefresh={onRefresh}
            refreshing={refreshing}
            renderItem={({ item }) => renderActivity(item)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
