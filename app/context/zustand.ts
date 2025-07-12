import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoaded: boolean;
  setUser: (user: User | null) => void;
  setToken: (user: string | null) => void;
  loadAuth: () => Promise<void>;
}

const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoaded: false,
  setUser: (user) => set({ user }),
  setToken: async (token) => {
    if (token) await SecureStore.setItemAsync("userToken", token);
    else await SecureStore.deleteItemAsync("userToken");
    set({ token });
  },
  loadAuth: async () => {
    const token = await SecureStore.getItemAsync("userToken");
    // If you store user in SecureStore, retrieve it here too.
    set({ token, isLoaded: true });
  },
}));

export default useAuth;
