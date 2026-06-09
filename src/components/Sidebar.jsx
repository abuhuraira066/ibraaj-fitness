import logo from "../assets/logo.jpg.jpeg";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "260px",
        background: "linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)",
        borderRight: "2px solid #FFD700",
        minHeight: "100vh",
        padding: "25px 15px",
        boxShadow: "10px 0 30px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,215,0,0.2)",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo Section with Gold Effect */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(255,215,0,0.3)",
        }}
      >
        <img
          src={logo}
          alt="IBRAAJ FITNESS"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "contain",
            marginBottom: "15px",
            filter: "drop-shadow(0 0 10px gold)",
            borderRadius: "50%",
          }}
        />
        
        <h2
          style={{
            color: "#FFD700",
            textAlign: "center",
            margin: "0",
            fontSize: "24px",
            letterSpacing: "2px",
            fontFamily: "Cinzel, serif",
            textShadow: "0 0 10px rgba(255,215,0,0.5)",
          }}
        >
          IBRAAJ
        </h2>
        <p
          style={{
            color: "#d4af37",
            fontSize: "10px",
            marginTop: "5px",
            letterSpacing: "3px",
            opacity: 0.7,
          }}
        >
          FITNESS
        </p>
      </div>

      {/* Menu Links with Premium Gold Style */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Link
          to="/"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
            color: "#FFD700",
            border: "1px solid #FFD700",
            boxShadow: "0 0 10px rgba(255,215,0,0.4)",
            padding: "14px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            e.currentTarget.style.color = "#0a0a0a";
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)";
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.transform = "translateX(0px)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)";
          }}
        >
          <span style={{ fontSize: "20px" }}>🏠</span>
          <span>Dashboard</span>
        </Link>

        <Link
          to="/members"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
            color: "#FFD700",
            border: "1px solid #FFD700",
            boxShadow: "0 0 10px rgba(255,215,0,0.4)",
            padding: "14px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            e.currentTarget.style.color = "#0a0a0a";
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)";
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.transform = "translateX(0px)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)";
          }}
        >
          <span style={{ fontSize: "20px" }}>👥</span>
          <span>Members</span>
        </Link>

        <Link
          to="/attendance"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
            color: "#FFD700",
            border: "1px solid #FFD700",
            boxShadow: "0 0 10px rgba(255,215,0,0.4)",
            padding: "14px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            e.currentTarget.style.color = "#0a0a0a";
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)";
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.transform = "translateX(0px)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)";
          }}
        >
          <span style={{ fontSize: "20px" }}>📅</span>
          <span>Attendance</span>
        </Link>

        <Link
          to="/accounts"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
            color: "#FFD700",
            border: "1px solid #FFD700",
            boxShadow: "0 0 10px rgba(255,215,0,0.4)",
            padding: "14px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            e.currentTarget.style.color = "#0a0a0a";
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)";
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.transform = "translateX(0px)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)";
          }}
        >
          <span style={{ fontSize: "20px" }}>💰</span>
          <span>Accounts</span>
        </Link>

        <Link
          to="/expenses"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
            color: "#FFD700",
            border: "1px solid #FFD700",
            boxShadow: "0 0 10px rgba(255,215,0,0.4)",
            padding: "14px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            e.currentTarget.style.color = "#0a0a0a";
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)";
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.transform = "translateX(0px)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)";
          }}
        >
          <span style={{ fontSize: "20px" }}>💸</span>
          <span>Expenses</span>
        </Link>

        <Link
          to="/reports"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
            color: "#FFD700",
            border: "1px solid #FFD700",
            boxShadow: "0 0 10px rgba(255,215,0,0.4)",
            padding: "14px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            e.currentTarget.style.color = "#0a0a0a";
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)";
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.transform = "translateX(0px)";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)";
          }}
        >
          <span style={{ fontSize: "20px" }}>📊</span>
          <span>Reports</span>
        </Link>
      </div>

      {/* Bottom Section with Logout Button */}
      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,215,0,0.3)",
          textAlign: "center",
        }}
      >
        <Link
          to="/settings"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)",
            color: "#FFD700",
            border: "1px solid #FFD700",
            boxShadow: "0 0 10px rgba(255,215,0,0.4)",
            padding: "12px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            justifyContent: "center",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            e.currentTarget.style.color = "#0a0a0a";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #1a1a1a 0%, #111111 100%)";
            e.currentTarget.style.color = "#FFD700";
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.4)";
          }}
        >
          <span style={{ fontSize: "18px" }}>⚙️</span>
          <span>Settings</span>
        </Link>

        {/* ✅ Logout Button Added */}
        <button
          onClick={handleLogout}
          style={{
            background: "linear-gradient(135deg, #ff4444, #cc0000)",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            width: "100%",
            justifyContent: "center",
            marginTop: "15px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 5px 15px rgba(255,68,68,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>

        <div
          style={{
            fontSize: "10px",
            color: "#d4af37",
            marginTop: "15px",
            opacity: 0.5,
            letterSpacing: "1px",
          }}
        >
          GOLD EDITION v2.0
        </div>
      </div>
    </div>
  );
}