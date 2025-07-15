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
  faBars,
  faCancel,
  faComment,
  faEllipsisVertical,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Header = ({
  title,
  rightComponent,
  showBackButton,
}: {
  title: string;
  rightComponent?: "noMenu" | "mainMenu" | "actionMenu";
  showBackButton?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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
        {rightComponent === "actionMenu" && (
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
        )}
        {rightComponent === "mainMenu" && <FontAwesomeIcon icon={faBars} />}
      </View>
    </View>
  );
};

export default Header;
