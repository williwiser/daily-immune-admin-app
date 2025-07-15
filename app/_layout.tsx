import { NotificationProvider } from "@/context/NotificationContext";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as React from "react";
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(protected)"></Stack.Screen>
      </Stack>
    </NotificationProvider>
  );
}
