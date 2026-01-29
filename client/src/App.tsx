import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import Collaborations from "./pages/Collaborations";
import CollaborationDetail from "./pages/CollaborationDetail";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" />;

  // Redirect to profile setup if profile is incomplete
  if (!user.profile_complete && window.location.pathname !== "/profile") {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.profile_complete) return <Navigate to="/dashboard" />;
  if (user && !user.profile_complete) return <Navigate to="/profile" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          <Route path="/projects/new" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
          <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
          <Route path="/collaborations" element={<PrivateRoute><Collaborations /></PrivateRoute>} />
          <Route path="/collaborations/:id" element={<PrivateRoute><CollaborationDetail /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
