import axiosClient from "./axiosClient";

export const getTasks = (workspaceId) => 
    axiosClient.get(`/workspaces/${workspaceId}/tasks`);

export const getUserTasks = () => 
    axiosClient.get("/tasks");

export const createTask = (workspaceId, data) => 
    axiosClient.post(`/workspaces/${workspaceId}/tasks`, data);

export const updateTask = (taskId, data) =>
    axiosClient.put(`/tasks/${taskId}`, data);

export const updateTaskStatus = (taskId, status) => 
    axiosClient.patch(`/tasks/${taskId}/status`, { status });

export const assignTask = (taskId, userId) => 
    axiosClient.patch(`/tasks/${taskId}/assign`, { userId });

export const deleteTask = (taskId) =>
    axiosClient.delete(`/tasks/${taskId}`);
