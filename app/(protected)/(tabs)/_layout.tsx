import {
  faCalendarCheck,
  faHome,
  faMessage,
  faNewspaper,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "#28A745", headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeIcon
              icon={faHome}
              color={focused ? "#28A745" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeIcon
              icon={faNewspaper}
              color={focused ? "#28A745" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeIcon
              icon={faMessage}
              color={focused ? "#28A745" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ focused }) => (
            <FontAwesomeIcon
              icon={faUsers}
              color={focused ? "#28A745" : "gray"}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
