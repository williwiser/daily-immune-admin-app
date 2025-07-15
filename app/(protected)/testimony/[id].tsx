import Header from "@/app/components/Header";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}
interface Testimony {
  title: string;
  body: string;
  thumbnail: string;
  createdAt: Date;
  status: string;
  user?: User;
}

export default function TestimonyArticle() {
  const { id } = useLocalSearchParams();
  const [testimony, setTestimony] = useState<Testimony>({
    title: "",
    body: "",
    thumbnail: "",
    createdAt: new Date(),
    status: "",
    user: undefined,
  });

  useEffect(() => {
    const fetchTestimony = async () => {
      try {
        const response = await axios.get(
          `https://daily-immune.ew.r.appspot.com/api/v1/testimonies/${id}`
        );
        setTestimony(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTestimony();
  }, [id]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Testimony" showBackButton rightComponent="actionMenu" />
      <ScrollView>
        <Image
          source={
            testimony.thumbnail
              ? { uri: testimony.thumbnail }
              : require("../../../assets/images/placeholder.jpg")
          }
          className="h-48 w-full"
          resizeMode="cover"
        />
        <View className="px-4 py-6">
          <Text className="text-2xl font-semibold">{testimony.title}</Text>
          <Text className="text-gray-500 italic mb-4">
            By{" "}
            <Text>
              {testimony.user?.firstName} {testimony.user?.lastName}
            </Text>
            {" • "}
            {new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
              new Date(testimony.createdAt)
            )}
          </Text>
          <Text className="text-gray-500">{testimony.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
