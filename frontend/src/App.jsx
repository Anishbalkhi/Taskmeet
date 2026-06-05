import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { RoleProvider } from "./context/RoleContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <NotificationProvider>
          <RoleProvider>
            <AppRoutes />
          </RoleProvider>
        </NotificationProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;



