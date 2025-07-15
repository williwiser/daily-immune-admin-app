import Header from "@/app/components/Header";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Testimony {
  id: string;
  title: string;
  body: string;
  thumbnail: string;
}

interface PrayerRequest {
  id: string;
  subject: string;
  body: string;
  isAnswered: boolean;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  status: string;
  role: string;
  profilePhoto: string;
  createdAt: Date;
  testimonies: Testimony[];
}

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<User>({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    role: "",
    status: "",
    profilePhoto: "",
    createdAt: new Date(),
    testimonies: [],
  });
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);

  const truncateText = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;

    return words.slice(0, wordLimit).join(" ") + "...";
  };

  useFocusEffect(() => {
    axios
      .get(`https://daily-immune.ew.r.appspot.com/api/v1/users/${id}`)
      .then((response) => {
        setUser(response.data);
      });

    axios
      .get(
        `https://daily-immune.ew.r.appspot.com/api/v1/prayers?page=1&limit=6&userId=${id}`
      )
      .then((response) => {
        setPrayerRequests(response.data);
      });
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="User" showBackButton />
      <ScrollView>
        <View className="flex justify-center items-center px-4 py-6">
          {user.profilePhoto ? (
            <Image
              source={{ uri: user.profilePhoto }}
              className="size-36 mb-4 rounded-full"
              resizeMode="contain"
            />
          ) : (
            <View className="flex justify-center items-center size-36 mb-4 rounded-full bg-stone-200">
              <Text className="text-5xl">{user.firstName[0]}</Text>
            </View>
          )}

          <Text className="text-2xl font-semibold mb-1">{`${user.firstName} ${user.lastName}`}</Text>
          <Text className="text-[#28A745] mb-1">{user.email}</Text>
          <Text className="text-gray-500 mb-4">
            Joined{" "}
            {new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
              new Date(user.createdAt)
            )}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <Button
              className="bg-gray-100"
              onPress={() => console.log("Message")}
            >
              <Text className="font-semibold">Message</Text>
            </Button>
            <Button
              className={
                user.status === "blocked" ? "bg-blue-500" : "bg-red-500"
              }
              onPress={() =>
                router.push({
                  pathname:
                    user.status === "blocked"
                      ? "/(protected)/user/unblock"
                      : "/(protected)/user/block",
                  params: {
                    id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePhoto: user.profilePhoto,
                  },
                })
              }
            >
              <Text className="text-white font-semibold">
                {user.status === "blocked" ? "Unblock" : "Block"}
              </Text>
            </Button>
          </View>
        </View>
        <View>
          <Text className="mx-4 text-2xl font-semibold mb-4">Testimonies</Text>
          {user.testimonies.length === 0 ? (
            <Text className="px-4 text-gray-500">No testimonies uploaded</Text>
          ) : (
            <FlatList
              data={user.testimonies}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="ml-4 w-56 overflow-hidden rounded-md border border-gray-200"
                  onPress={() =>
                    router.push({
                      pathname: "/(protected)/testimony/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  <Image
                    source={
                      item.thumbnail
                        ? { uri: item.thumbnail }
                        : require("../../../assets/images/placeholder.jpg")
                    }
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <View className="px-2 py-4">
                    <Text className="text-lg font-semibold mb-2">
                      {item.title}
                    </Text>
                    <Text className="text-gray-500 ">
                      {truncateText(item.body, 15)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View className="mt-8">
          <Text className="mx-4 text-2xl font-semibold mb-4">
            Prayer Requests
          </Text>
          {prayerRequests.length === 0 ? (
            <Text className="px-4 text-gray-500">
              No submitted prayer requests
            </Text>
          ) : (
            <FlatList
              data={prayerRequests}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity className="ml-4 w-56 overflow-hidden rounded-md border border-gray-200 mb-10">
                  <View className="px-2 py-4">
                    <Text
                      className={`text-sm mb-2 italic ${
                        item.isAnswered ? "text-green-500" : "text-amber-500"
                      }`}
                    >
                      {item.isAnswered ? "Answered" : "Still needs prayer"}
                    </Text>
                    <Text className="text font-semibold mb-2">
                      {item.subject}
                    </Text>
                    <Text className="text-gray-500 ">
                      {truncateText(item.body, 15)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
