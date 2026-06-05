import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAllWorkspaces } from "../api/workspaceApi";
import { getTasks } from "../api/taskApi";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext();

export const useWorkspace = () => useContext(WorkspaceContext);

// Normalize a task from the API so assignedTo is always { id, name, email } or null
function normalizeTask(task) {
    let assignedTo = null;
    if (task.assignedTo) {
        if (typeof task.assignedTo === "object" && task.assignedTo !== null) {
            assignedTo = {
                id: task.assignedTo.id || task.assignedTo._id || null,
                name: task.assignedTo.name || null,
                email: task.assignedTo.email || null,
            };
        } else if (typeof task.assignedTo === "string") {
            assignedTo = { id: task.assignedTo, name: null, email: null };
        }
    }
    return { ...task, id: task.id || task._id, assignedTo };
}

export const WorkspaceProvider = ({ children }) => {
    const { token } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskLoading, setTaskLoading] = useState(false);

    const fetchWorkspaces = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await getAllWorkspaces();
            const workspaceList = res.data.data || [];
            setWorkspaces(workspaceList);
            if (workspaceList.length > 0) {
                const savedId = localStorage.getItem("selectedWorkspaceId");
                const saved = savedId && workspaceList.find((w) => w.id === savedId);
                setCurrentWorkspace(saved || workspaceList[0]);
            } else {
                setCurrentWorkspace(null);
            }
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const fetchTasksForWorkspace = useCallback(async (workspace) => {
        if (!token || !workspace) return;
        try {
            setTaskLoading(true);
            const res = await getTasks(workspace.id);
            const raw = res.data.data || [];
            setTasks(raw.map(normalizeTask));
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            setTasks([]);
        } finally {
            setTaskLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTasksForWorkspace(currentWorkspace);
    }, [currentWorkspace, fetchTasksForWorkspace]);

    const refreshTasks = useCallback(async () => {
        await fetchTasksForWorkspace(currentWorkspace);
    }, [currentWorkspace, fetchTasksForWorkspace]);

    const addWorkspaceObj = (ws) => {
        setWorkspaces((prev) => [...prev, ws]);
        setCurrentWorkspace(ws);
        localStorage.setItem("selectedWorkspaceId", ws.id);
    };

    useEffect(() => {
        if (currentWorkspace?.id) {
            localStorage.setItem("selectedWorkspaceId", currentWorkspace.id);
        }
    }, [currentWorkspace]);

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                currentWorkspace,
                setCurrentWorkspace,
                tasks,
                setTasks,
                loading,
                taskLoading,
                refreshTasks,
                addWorkspaceObj,
                fetchWorkspaces,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};
