import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Panel from "./pages/Panel";
import PublicInvite from "./pages/PublicInvite";

function ProtectedRoute({ children }) {
  const { agency, loading } = useAuth();
  if (loading) return <div className="page-loading">Cargando…</div>;
  if (!agency) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/panel"
        element={
          <ProtectedRoute>
            <Panel />
          </ProtectedRoute>
        }
      />
      <Route path="/i/:slug" element={<PublicInvite />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
