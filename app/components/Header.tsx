import { Ionicons } from "@expo/vector-icons"; // or your preferred icon library
import { router } from "expo-router";
import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Header = ({
  title,
  rightComponent,
  showBackButton,
}: {
  title: string;
  rightComponent?: ReactNode;
  showBackButton?: boolean;
}) => {
  return (
    <View className="flex-row items-center px-4 py-6">
      {/* Left side - Icon */}
      <View className="w-10 h-10 justify-center items-center">
        {showBackButton && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {/* Center - Title (positioned absolutely to ensure perfect centering) */}
      <View className="absolute left-0 right-0 items-center">
        <Text className="text-xl font-semibold text-gray-900">{title}</Text>
      </View>

      {/* Right side - Optional component */}
      <View className="w-10 h-10 justify-center items-center ml-auto">
        {rightComponent}
      </View>
    </View>
  );
};

export default Header;
