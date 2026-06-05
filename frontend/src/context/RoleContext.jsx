import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";
import { useMemo } from "react";

export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
};

const PERMISSIONS = {
  ADMIN: [
    "createUser", "deactivateUser", "viewAnalytics", "removeUser",
    "createWorkspace", "inviteMembers", "removeMember", "manageWorkspace",
    "createTask", "assignTask", "editAnyTask", "deleteAnyTask",
    "viewAllTasks",
  ],
  MANAGER: [
    "createWorkspace", "inviteMembers",
    "createTask", "assignTask", "editAnyTask", "deleteAnyTask",
    "viewAllTasks",
  ],
  MEMBER: [
    "createTask", "viewAllTasks",
  ],
};

export const ROLE_CONFIG = {
  ADMIN: { label: "Admin", emoji: "👑", color: "rgba(251,191,36,0.15)", textColor: "#f59e0b" },
  MANAGER: { label: "Manager", emoji: "🛡️", color: "rgba(99,102,241,0.15)", textColor: "#818cf8" },
  MEMBER: { label: "Member", emoji: "👤", color: "rgba(107,114,128,0.15)", textColor: "#9ca3af" },
};

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const role = useMemo(() => {
    if (!user) return ROLES.MEMBER;
    if (user.role === "ADMIN") return ROLES.ADMIN;

    if (currentWorkspace) {
      const wsRole = (currentWorkspace.role || "").toLowerCase();
      if (wsRole === "owner" || wsRole === "admin") return ROLES.ADMIN;
      if (wsRole === "manager") return ROLES.MANAGER;
    }

    return ROLES.MEMBER;
  }, [user, currentWorkspace]);

  const can = (permission) => PERMISSIONS[role]?.includes(permission) ?? false;

  const value = {
    role,
    isAdmin: role === ROLES.ADMIN,
    isManager: role === ROLES.MANAGER,
    isMember: role === ROLES.MEMBER,
    can,
    roleConfig: ROLE_CONFIG[role],
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => useContext(RoleContext);
