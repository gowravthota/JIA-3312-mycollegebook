import axios, { AxiosError } from "axios";
import { Platform } from "react-native";
import { User } from "./Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";


let baseURL = "http://localhost:8000/api/";
if (Platform.OS === "android") {
  baseURL = "http://10.0.2.2:8000/api/";
}

const api = axios.create({
  baseURL,
});

export async function refreshToken() {
  const token = await AsyncStorage.getItem("refreshToken");

  try {
    const response = await api.post("token/refresh/", {
      refresh: token,
    });
    return response.data.access;
  } catch (error) {
    return null;
  }
}

export async function createUser(userData: FormData): Promise<User> {
  const response = await api.post("/users/user/", userData, { headers: {"Content-Type":"multipart/form-data"} });
  return response.data;
}


export type VerifyCodeResponse = {
  error?: string;
  message?: string;
  code?: string;
}
/*
 * Verify the user's phone number with the received code.
 */
export async function sendVerificationCode() {
  const response = await api.get("/verification-code/");
  return response.data as VerifyCodeResponse;
}
export async function checkVerificationCode(code: string) {
  const response = await api.post("/verification-code/", { code });
  return response.data as VerifyCodeResponse;
}


/*
 * When a user reopens the app, check if they have a token and sign them in if they do.
 */
export async function signInWithToken(): Promise<User|null> {
  const token = await AsyncStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  const results = await api.get("/get-me/");
  const user = results.data as User;

  return user;
}

/**
 * Sign the user in with their username and password, storing the tokens in AsyncStorage.
 */
export async function signIn(
  username: string,
  password: string
): Promise<User> {
  const response = await api.post("/token/", {
    username,
    password,
  });

  await AsyncStorage.setItem("accessToken", response.data.access);
  await AsyncStorage.setItem("refreshToken", response.data.refresh);

  // Get the user's details once they're signed in, and return that.
  const user = (await api.get("/get-me/")).data;
  return user;
}

// TODO: Add API methods with specified types.

// Add the access token to every request if it exists.
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});


// TODO: Handle refresh token
// Try refreshing the access token if refresh token exists
api.interceptors.response.use(undefined, async (error) => {
  const axiosError = error as AxiosError;

  const isAuthError = axiosError.response && axiosError.response.status === 401;
  const hasTokens = true; // temporary for now.
  if (isAuthError && hasTokens) {
    // There are many ways isAuthError can be true, and the access token is valid (i.e. protected route).
    // For instance, when logging in, if incorrect username/password, then isAuthError will also be true.
    // When implementing code to handle refresh, check to see if auth/refresh keys exists.
    // If they do, then perform a new request on api/token/refresh/ that refreshes the access token.
    // This should probably also retry the orginial request once the new auth token is returned.

    // const token = await refreshToken();
    return Promise.resolve(error); // temporary for now. Not error handled yet.
  }

  return Promise.reject(error);
});

/*
 * Axios request interceptor for handling global app connection errors.
 * This should only be used in <MainApp />!
 */
export function useConnectionErrorInterceptor() {
  const [connectionError, setConnectionError] = useState<AxiosError>();

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const axiosError = error as AxiosError;

        // Connection Errors
        const isServerError =
          axiosError.response &&
          axiosError.response.status >= 500 &&
          axiosError.response.status <= 599;
        const isTimeoutError = axiosError.code === AxiosError.ECONNABORTED;

        setConnectionError(
          isServerError || isTimeoutError ? error : null
        );

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(interceptorId);
    };
  }, []);

  return { connectionError, setConnectionError };
}

export default api;
