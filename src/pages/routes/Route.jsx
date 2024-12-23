import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../../contexts/useAuth";
import Login from "../../Auth/Login";

const SidebarRoutes = () => {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/uploadtab"
        element={isAuthenticated ? <Navigate to="/uploadtab" /> : <Login />}
      />
      <Route
        path="/categories"
        element={isAuthenticated ? <Navigate to="/categories" /> : <Login />}
      />
      <Route
        path="/approval"
        element={isAuthenticated ? <Navigate to="/approval" /> : <Login />}
      />
      <Route
        path="/variants"
        element={isAuthenticated ? <Navigate to="/variants" /> : <Login />}
      />
    </Routes>
  );
};

export default SidebarRoutes;
