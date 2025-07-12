import { Redirect, Stack } from "expo-router";
import React from "react";
import useAuth from "../context/zustand";

export default function AuthLayout() {
  const { user } = useAuth();
  const isLoggedIn = user !== null;
  if (!isLoggedIn) return <Redirect href="/login" />;
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="testimony" options={{ headerShown: false }} />
      <Stack.Screen name="user" options={{ headerShown: false }} />
    </Stack>
  );
}
