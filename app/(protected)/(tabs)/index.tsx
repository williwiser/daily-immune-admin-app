import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
  useEffect(() => {
    axios
      .get(`https://daily-immune.ew.r.appspot.com/api/v1/users/stats`)
      .then((response) => {
        setStatistics(response.data);
      });
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Dashboard" />

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

        <View className="flex flex-row gap-4 w-full mb-4 flex-wrap">
          <TouchableOpacity className="flex flex-wrap gap-2 items-center p-6 bg-white rounded-md border border-gray-200 w-[48%]">
            <Ionicons name="arrow-up" size={24} color="#000" />
            <Text className="text-base text-black flex-shrink w-full text-center">
              Upload Devotionals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-wrap gap-2 items-center p-6 bg-white rounded-md border border-gray-200 w-[48%]">
            <Ionicons name="camera" size={24} color="#000" />
            <Text className="text-base text-black flex-shrink w-full text-center">
              Livestream
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
