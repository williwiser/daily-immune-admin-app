import { NotificationProvider } from "@/context/NotificationContext";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  return (
    <NotificationProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(protected)"></Stack.Screen>
        </Stack>
      </SafeAreaProvider>
    </NotificationProvider>
  );
}
