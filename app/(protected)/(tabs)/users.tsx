import { api } from "@/data/constants";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // 👇 Put your data reloading logic here
    api.get("/users").then((response) => {
      setUsers(response.data);
      console.log(response.data);
    });
    setRefreshing(false);
  };

  useEffect(() => {
    api.get("/users").then((response) => {
      setUsers(response.data);
      console.log(response.data);
    });
  }, []);

  const handleSearch = (query: string) => {
    if (query === "") {
      api.get("/users").then((response) => {
        setUsers(response.data);
        console.log(response.data);
      });
    } else {
      api.get(`/users/search?q=${query}&limit=20&page=1`).then((response) => {
        setUsers(response.data);
        console.log(response.data);
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Users" rightComponent="profile" />
      <View className="flex flex-row items-center my-4 mx-4 gap-2 border border-gray-300 px-2 rounded-md">
        <View>
          <FontAwesomeIcon icon={faSearch} color="#6b7280" />
        </View>
        <TextInput
          className="flex-1"
          placeholder="Search users..."
          onChangeText={handleSearch}
        />
      </View>
      {users.length === 0 ? (
        <Text className="my-6 text-gray-500 w-full text-center">No users</Text>
      ) : (
        <FlatList
          data={users}
          onRefresh={onRefresh}
          refreshing={refreshing}
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
      )}
    </SafeAreaView>
  );
}
