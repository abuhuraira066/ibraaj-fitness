import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #050505, #111111, #1a1200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFD700",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
}