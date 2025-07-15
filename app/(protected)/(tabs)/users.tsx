import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    axios
      .get("https://daily-immune.ew.r.appspot.com/api/v1/users")
      .then((response) => {
        setUsers(response.data);
        console.log(response.data);
      });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Users" rightComponent="mainMenu" />
      <FlatList
        data={users}
        renderItem={({ item }: { item: User }) => {
          return (
            <TouchableOpacity
              className="flex flex-row items-center gap-4 px-4 py-2"
              onPress={() =>
                router.push({
                  pathname: "../user/[id]",
                  params: { id: item.id },
                })
              }
            >
              {item.profilePhoto ? (
                <Image
                  source={{ uri: item.profilePhoto }}
                  className="size-20 rounded-full"
                />
              ) : (
                <View className="inline-flex justify-center items-center size-20 bg-stone-200 rounded-full">
                  <Text className="text-3xl">{item.firstName[0]}</Text>
                </View>
              )}

              <View>
                <Text className="text font-semibold mb-1">{`${item.firstName} ${item.lastName}`}</Text>
                <Text className="text-[#28A745] text-sm">{item.email}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
