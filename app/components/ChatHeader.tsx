import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ionicons } from "@expo/vector-icons"; // or your preferred icon library
import {
  faCancel,
  faComment,
  faEllipsisVertical,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ChatHeader = ({
  name,
  showBackButton,
  profilePhoto,
  online,
}: {
  name: string;
  showBackButton?: boolean;
  profilePhoto?: string;
  online?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  return (
    <View className="flex-row items-center px-4 pt-6 pb-2 border-b border-gray-200 bg-white">
      {/* Left side - Icon */}
      <View className="w-10 h-10 justify-center items-center mr-4">
        {showBackButton && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        {/* Center - Title (positioned absolutely to ensure perfect centering) */}
      </View>
      <View className="flex-row items-center gap-4">
        {profilePhoto ? (
          <Image
            source={{ uri: profilePhoto }}
            className="size-14 rounded-full"
          />
        ) : (
          <View className="inline-flex justify-center items-center size-14 bg-stone-200 rounded-full">
            <Text className="text-2xl">{name[0]}</Text>
          </View>
        )}
        <View>
          <Text className="text-xl font-semibold text-gray-900">{name}</Text>
          <Text className="text-gray-500 text-sm">
            {online ? "Online" : "Last seen 2 hours ago"}
          </Text>
        </View>
      </View>
      {/* Right side - Optional component */}
      <View className="w-10 h-10 justify-center items-center ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TouchableOpacity className="flex justify-center items-center w-full h-full">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </TouchableOpacity>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            insets={contentInsets}
            className="bg-white w-56 native:w-64 border-none border-white"
          >
            <DropdownMenuLabel>
              <Text>Admin Actions</Text>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-300 mx-2" />
            <DropdownMenuItem asChild>
              <TouchableOpacity className="inline-flex flex-row gap-2 items-center py-4 h-12">
                <FontAwesomeIcon icon={faCancel} />
                <Text>Block</Text>
              </TouchableOpacity>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <TouchableOpacity className="flex flex-row gap-2 items-center py-4 h-12">
                <FontAwesomeIcon icon={faTrashCan} />
                <Text>Delete</Text>
              </TouchableOpacity>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <TouchableOpacity className="flex flex-row gap-2 items-center py-4 h-12">
                <FontAwesomeIcon icon={faComment} />
                <Text>Comment</Text>
              </TouchableOpacity>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
    </View>
  );
};

export default ChatHeader;
