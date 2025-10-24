import Header from "@/app/components/Header";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/zustand";
import { api } from "@/data/constants";
import {
  faEarth,
  faHourglass,
  faRemove,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from "react-native";

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
  const { token } = useAuth();
  const [status, setStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
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
        const response = await api.get(`/testimonies/${id}`);
        setTestimony(response.data);
        setStatus(response.data.status);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTestimony();
  }, [id]);

  const handleTestimonyStatus = async () => {
    setIsLoading(true);
    const config = {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    };
    switch (status) {
      case "pending":
        try {
          await api.patch(
            `/testimonies/${id}/admin`,
            {
              status: "published",
            },
            config
          );
          setStatus("published");
          ToastAndroid.show("Testimony has been published", ToastAndroid.SHORT);
        } catch (error) {
          console.log(error);
          ToastAndroid.show(
            "Something went wrong, please try again later",
            ToastAndroid.SHORT
          );
        } finally {
          setIsLoading(false);
          break;
        }

      case "published":
        try {
          await api.patch(
            `/testimonies/${id}/admin`,
            {
              status: "blocked",
            },
            config
          );
          setStatus("blocked");
          ToastAndroid.show("Testimony has been hidden", ToastAndroid.SHORT);
        } catch (error) {
          console.log(error);
          ToastAndroid.show(
            "Something went wrong, please try again later",
            ToastAndroid.SHORT
          );
        } finally {
          setIsLoading(false);
          break;
        }

      case "blocked":
        try {
          await api.patch(
            `/testimonies/${id}/admin`,
            {
              status: "published",
            },
            config
          );
          setStatus("published");
          ToastAndroid.show("Testimony has been published", ToastAndroid.SHORT);
        } catch (error) {
          console.log(error);
          ToastAndroid.show(
            "Something went wrong, please try again later",
            ToastAndroid.SHORT
          );
        } finally {
          setIsLoading(false);
          break;
        }
      default:
        setStatus("");
        setIsLoading(false);
        break;
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <View>
            <View className="flex-row p-2 gap-2 rounded-md bg-gray-100 mb-4 items-center border border-gray-50">
              <FontAwesomeIcon icon={faHourglass} color="#6b7280" />
              <Text className="text-gray-500">
                Testimony is pending approval
              </Text>
            </View>
            <Button
              className="bg-green-500 mb-4"
              onPress={handleTestimonyStatus}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white">Approve</Text>
              )}
            </Button>
          </View>
        );
      case "published":
        return (
          <View>
            <View className="flex-row p-2 gap-2 rounded-md bg-gray-100 mb-4 items-center border border-gray-50">
              <FontAwesomeIcon icon={faEarth} color="#6b7280" />
              <Text className="text-gray-500">Testimony is public</Text>
            </View>
            <Button className="bg-red-500 mb-4" onPress={handleTestimonyStatus}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white">Hide Testimony</Text>
              )}
            </Button>
          </View>
        );
      case "blocked":
        return (
          <View>
            <View className="flex-row p-2 gap-2 rounded-md bg-gray-100 mb-4 items-center border border-gray-50">
              <FontAwesomeIcon icon={faRemove} color="#6b7280" />
              <Text className="text-gray-500"> Testimony is hidden</Text>
            </View>
            <Button
              className="bg-green-500 mb-4"
              onPress={handleTestimonyStatus}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-white">Unblock</Text>
              )}
            </Button>
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title={testimony.title}
        showBackButton
        rightComponent="actionMenu"
      />
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
        <View className="px-6 py-6">
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
          {renderStatus(status)}
          <Text className="text-gray-500">{testimony.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
