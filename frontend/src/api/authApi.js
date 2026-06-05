import axiosClient from "./axiosClient";

export const loginApi = (data) =>
  axiosClient.post("/auth/login", data);

export const registerApi = (data) =>
  axiosClient.post("/auth/register", data);

export const forgotPasswordApi = (email) =>
  axiosClient.post("/auth/forgot-password", { email });

export const resetPasswordApi = (token, password) =>
  axiosClient.post("/auth/reset-password", { token, password });

export const verifyEmailApi = (token) =>
  axiosClient.get(`/auth/verify-email?token=${token}`);
