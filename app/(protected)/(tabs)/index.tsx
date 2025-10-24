import { useSocket } from "@/context/useSocket";
import useAuth from "@/context/zustand";
import { api } from "@/data/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";

interface Statistic {
  totalUsers: number;
  activeUsers: number;
  prayerRequests: number;
  testimonies: number;
}

export default function Index() {
  const [statistics, setStatistics] = useState<Statistic>({
    totalUsers: 0,
    activeUsers: 0,
    prayerRequests: 0,
    testimonies: 0,
  });
  const { user } = useAuth();
  const { socket } = useSocket();
  useEffect(() => {
    api.get(`/users/stats`).then((response) => {
      setStatistics(response.data);
    });

    console.log("some socket", socket?.id);
  }, [socket]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Dashboard" rightComponent="profile" />
      <View className="p-4">
        <View className="flex-row items-center gap-4 ">
          {!user?.profilePhoto ? (
            <Image
              source={{ uri: user?.profilePhoto }}
              className="size-12 rounded-full"
            />
          ) : (
            <View className="justify-center items-center bg-stone-200 size-12 rounded-full">
              <Text>{user?.firstName[0]}</Text>
            </View>
          )}
          <View>
            <Text className="text-xl font-semibold">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-gray-400 uppercase text-sm">
              {user?.role}
            </Text>
          </View>
        </View>
      </View>
      {/* Your screen content */}
      <View className="p-4">
        <Text className="text-2xl font-semibold mb-4">Overview</Text>
        <View className="flex flex-row gap-4 w-full mb-4">
          <View className="flex-1 w-full p-6 rounded-md bg-stone-100">
            <Text className="mb-4 text-gray-500">Total Users</Text>
            <Text className="text-4xl font-semibold text-[#28A745]">
              {statistics.totalUsers}
            </Text>
          </View>

          <View className="bg-stone-100 flex-1 w-full p-6 rounded-md">
            <Text className="mb-4 text-gray-500">Active Users</Text>
            <Text className="text-4xl font-semibold text-[#28A745]">
              {statistics.activeUsers}
            </Text>
          </View>
        </View>
        <View className="flex flex-row gap-4 w-full mb-4">
          <View className="bg-stone-100 flex-1 w-full p-6 rounded-md">
            <Text className="mb-4 text-gray-500">Testimonies</Text>
            <Text className="text-4xl font-semibold text-[#28A745]">
              {statistics.testimonies}
            </Text>
          </View>

          <View className="bg-stone-100 flex-1 w-full p-6 rounded-md">
            <Text className="mb-4 text-gray-500">Prayer Requests</Text>
            <Text className="text-4xl font-semibold text-[#28A745]">
              {statistics.prayerRequests}
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text className="text-2xl font-semibold mb-4">Quick Actions</Text>
        <View className="flex flex-row gap-4 w-full mb-4 flex-wrap">
          <TouchableOpacity
            className="flex flex-wrap gap-2 justify-center items-center p-6 bg-white rounded-md border border-gray-200 w-[48%]"
            onPress={() => router.replace("/(protected)/(tabs)/users")}
          >
            <Ionicons name="people" size={24} color="#000" />
            <Text className="text-base text-black text-center flex-shrink w-full">
              Manage Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex flex-wrap gap-2 items-center p-6 bg-white rounded-md border border-gray-200 w-[48%]"
            onPress={() => router.replace("/(protected)/(tabs)/feed")}
          >
            <Ionicons name="newspaper" size={24} color="#000" />
            <Text className="text-base text-black flex-shrink w-full text-center">
              Moderate Content
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
