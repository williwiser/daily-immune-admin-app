import axios from "axios";

const environment = process.env.EXPO_PUBLIC_ENV;

export const api = axios.create({
  baseURL:
    environment === "development"
      ? "http://192.168.1.21:3000/api/v1"
      : `${process.env.EXPO_PUBLIC_API_URL}/api/v1`,
  timeout: 5000, // 5 seconds
});
