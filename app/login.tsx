import { useNotification } from "@/context/NotificationContext";
import { api } from "@/data/constants";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuth from "../context/zustand";

interface FormData {
  email: string;
  password: string;
}

// interface User {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   profilePhoto: string;
// }

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const { expoPushToken } = useNotification();
  const { setToken, setUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/mobile-login", data);

      const token = response.data.token;
      const user = response.data.user;

      const config = {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      };
      await api.post("/users/admin/pushToken", { expoPushToken }, config);
      await setToken(token);
      setUser(user);
      router.replace("/(protected)/(tabs)");
    } catch (error) {
      console.log(error);
      if (isAxiosError(error) && error.response?.status === 401)
        setErrorMessage("Invalid email or password");
      else setErrorMessage("Something went wrong. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 px-4 py-6 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"} // use 'padding' on iOS, 'height' on Android
          className="flex w-full justify-center items-center h-screen"
        >
          {isLoading ? (
            <ActivityIndicator color="#747474" size="large" />
          ) : (
            <View className="flex items-center w-full">
              <Text className="text-4xl text-center font-semibold mb-6 text-[#747474]">
                Log In
              </Text>

              <Controller
                control={control}
                name="email"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className={`border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md p-4 w-full mb-4 max-w-sm`}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    value={value}
                    placeholder="Email"
                  />
                )}
              />
              {errors.email && (
                <Text className="mb-4 text-red-500">
                  This field is required
                </Text>
              )}
              <Controller
                control={control}
                name="password"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className={`border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-md p-4 w-full mb-4 max-w-sm`}
                    placeholder="Password"
                    onChangeText={onChange}
                    autoCapitalize="none"
                    value={value}
                    secureTextEntry
                  />
                )}
              />
              {errors.password && (
                <Text className="mb-4 text-red-500">
                  This field is required
                </Text>
              )}

              <TouchableOpacity
                className="bg-stone-600 flex justify-center items-center p-4 rounded-md w-full max-w-sm"
                onPress={handleSubmit(onSubmit)}
              >
                <Text className="text-white">Log In</Text>
              </TouchableOpacity>
              {errorMessage && (
                <Text className="my-4 text-red-500">{errorMessage}</Text>
              )}
            </View>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
