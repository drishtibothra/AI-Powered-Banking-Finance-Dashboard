import apiClient from "../../api/client";

export interface SignupPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const signupRequest = (payload: SignupPayload) =>
  apiClient.post("/auth/signup", payload);

export const loginRequest = (payload: LoginPayload) =>
  apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>(
    "/auth/login",
    payload
  );

export const fetchCurrentUser = () =>
  apiClient.get<{ id: number; email: string }>("/auth/me");

export const refreshTokenRequest = (refresh_token: string) =>
  apiClient.post<{ access_token: string; token_type: string }>("/auth/refresh", { refresh_token });