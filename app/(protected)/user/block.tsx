import Header from "@/app/components/Header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuth from "@/context/zustand";
import { api } from "@/data/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const reasons = [
  { label: "Inappropriate behaviour" },
  { label: "Violation of Terms of Service" },
  { label: "Spamming or Advertising" },
  { label: "Fake or Misleading Information" },
  { label: "Harassment or Abuse" },
  { label: "Suspicious or Fraudulent Activity" },
  { label: "Security Threat" },
  { label: "Other" },
];

export default function Block() {
  const { id, firstName, lastName } = useLocalSearchParams();
  const { token } = useAuth();
  const [data, setData] = useState({ reason: "", notes: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleTextChange = (text: string) => {
    setData((prev) => ({ ...prev, notes: text }));
  };

  const config = {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  };
  const blockUser = async () => {
    console.log(data);
    setIsLoading(true);
    try {
      const response = await api.post(`/users/block/${id}`, data, config);
      if (response.status === 401)
        ToastAndroid.show("Only admins can block users", ToastAndroid.SHORT);
      else {
        router.back();
        ToastAndroid.show(
          `${firstName} ${lastName} has been blocked successfully`,
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
      <Header title="Block Confirmation" showBackButton />
      <View className="px-4 py-6">
        <Text className="text-2xl font-semibold mb-4">Are you sure?</Text>
        <Text className="text-gray-500 mb-4">
          You&apos;re about to block{" "}
          <Text className="font-semibold">{firstName}</Text>. This action will
          prevent them from logging in or accessing any part of the app until
          unblocked. Are you sure you want to continue?
        </Text>
        <Select className="mb-4">
          <SelectTrigger className="w-full border border-gray-300">
            <SelectValue
              className="text-sm native:text-lg text-gray-500"
              placeholder="Reason"
            />
          </SelectTrigger>
          <SelectContent
            insets={contentInsets}
            className="bg-white w-full border-gray-200"
          >
            <SelectGroup>
              {reasons.map((reason, index) => (
                <SelectItem
                  key={index}
                  label={reason.label}
                  value={reason.label}
                  onPress={() =>
                    setData((prev) => ({ ...prev, reason: reason.label }))
                  }
                >
                  {reason.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <TextInput
          placeholder="Additional Notes (Optional)"
          onChangeText={handleTextChange}
          multiline
          numberOfLines={6}
          maxLength={100}
          className="placeholder:text-lg border border-gray-300 rounded-md h-52 align-top mb-4 px-2"
        />
        <View className="flex flex-row gap-4 justify-end">
          <Button
            className="bg-gray-200 max-w-36"
            variant="destructive"
            onPress={() => router.back()}
          >
            <Text className="text-black font-semibold">Cancel</Text>
          </Button>
          <Button
            className="bg-red-500 w-24"
            variant="destructive"
            onPress={blockUser}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Block</Text>
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
