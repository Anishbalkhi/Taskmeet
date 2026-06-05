import axiosClient from "./axiosClient";

export const getNotifications = () => axiosClient.get("/notifications");
export const markAsRead = (id) => axiosClient.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => axiosClient.patch("/notifications/read-all");
export const acceptInvite = (id) => axiosClient.post(`/notifications/${id}/accept`);
export const declineInvite = (id) => axiosClient.post(`/notifications/${id}/decline`);
