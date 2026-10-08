import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "./api/api";

const Protect = ({ allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      try {
        // First check access token
        const response = await api.get("/auth/me");

        setUser(response.data.user);
      } catch (error) {
        // Access token expired/invalid
        if (error.response?.status === 401) {
          try {
            // Refresh token cookie is automatically sent
            await api.post("/auth/refresh");

            // New access token cookie is now set by backend
            // Try /me again
            const response = await api.get("/auth/me");

            setUser(response.data.user);
          } catch (refreshError) {
            // Refresh token is also expired/invalid
            if (refreshError.response?.status === 401) {
              setUser(null);
            } else {
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Access + refresh token both invalid
  if (!user) {
    return <Navigate to='/' replace />;
  }

  // Check role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};

export default Protect;
