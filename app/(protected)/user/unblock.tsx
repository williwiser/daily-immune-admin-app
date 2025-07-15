import Header from "@/app/components/Header";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/zustand";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";

import { ActivityIndicator, Text, ToastAndroid, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Unblock() {
  const { id, firstName, lastName, profilePhoto } = useLocalSearchParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const config = {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  };
  const unblockUser = async () => {
    setIsLoading(true);
    try {
      const response = await axios.patch(
        `https://daily-immune.ew.r.appspot.com/api/v1/users/unblock/${id}`,
        {},
        config
      );
      if (response.status === 401)
        ToastAndroid.show("Only admins can unblock users", ToastAndroid.SHORT);
      else {
        router.back();
        ToastAndroid.show(
          `${firstName} ${lastName} has been unblocked successfully`,
          ToastAndroid.LONG
        );
      }
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Unblock Confirmation" showBackButton />
      <View className="px-4 py-6">
        <Text className="text-2xl font-semibold mb-4">Are you sure?</Text>
        <Text className="text-gray-500 mb-4">
          You are about to unblock{" "}
          <Text className="font-semibold">{firstName}</Text>. This will
          immediately restore their access to the app. Please confirm that this
          decision has been reviewed and deemed appropriate.
        </Text>

        <View className="flex flex-row gap-4 justify-end">
          <Button
            className="bg-gray-200 max-w-36"
            variant="destructive"
            onPress={() => router.back()}
          >
            <Text className="text-black font-semibold">Cancel</Text>
          </Button>
          <Button
            className="bg-blue-500 w-28"
            variant="default"
            onPress={unblockUser}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Unblock</Text>
            )}
          </Button>
        </View>
        {error && (
          <Text className="text-red-500 text-center w-full mt-4">
            Something went wrong, please try again later.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
