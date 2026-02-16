import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { Auth } from "@/api/auth";

const TOKEN_KEY = "bakelink-token";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || "");
  const loading = ref(false);

  const setToken = (value) => {
    token.value = value;
    localStorage.setItem(TOKEN_KEY, value);
    axios.defaults.headers.common["Authorization"] = `Bearer ${value}`;
  };

  const login = async ({ email, password }) => {
    if (loading.value) return null;

    loading.value = true;
    try {
      const res = await Auth.Login({ email, password });

      const newToken = res.data.token;
      if (!newToken) {
        throw new Error("登入失敗，未取得 token");
      }
      setToken(newToken);
      return newToken;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = "";
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
  };

  return {
    token,
    loading,
    login,
    logout,
  };
});
