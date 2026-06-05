import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
import VerifyInfo from "../pages/VerifyInfo";
import UserHome from "../pages/UserHome";
import TeamHome from "../pages/TeamHome";
import CreateWorkspace from "../pages/CreateWorkspace";
import WorkspaceSettings from "../pages/Workspace";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-info" element={<VerifyInfo />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><MainLayout /></ProtectedRoute>}
      >
        <Route index element={<UserHome />} />
        <Route path="home" element={<UserHome />} />
        <Route path="team" element={<TeamHome />} />
        <Route path="workspace" element={<WorkspaceSettings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="create-workspace" element={<CreateWorkspace />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
