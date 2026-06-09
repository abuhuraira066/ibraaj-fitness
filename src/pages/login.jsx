import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      // ✅ TEMPORARY DEBUG CODE - Exact error dikhane ke liye
      console.log("🔴 Firebase Error:", err);
      console.log("Error Code:", err.code);
      console.log("Error Message:", err.message);
      alert(`Error Code: ${err.code}\n\nMessage: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050505, #111111, #1a1200)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
          border: "2px solid #FFD700",
          borderRadius: "20px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 0 30px rgba(255,215,0,0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "64px", marginBottom: "10px" }}>🏋️</div>
          <h1
            style={{
              color: "#FFD700",
              fontSize: "28px",
              marginBottom: "10px",
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            IBRAAJ FITNESS
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>Admin Login Portal</p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "15px",
              background: "#0a0a0a",
              border: "1px solid #FFD700",
              color: "white",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 8px rgba(255,215,0,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              background: "#0a0a0a",
              border: "1px solid #FFD700",
              color: "white",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 8px rgba(255,215,0,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            required
          />

          {error && (
            <p
              style={{
                color: "#ff4444",
                textAlign: "center",
                marginBottom: "15px",
                fontSize: "13px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #FFD700, #B8860B)",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
              color: "#0a0a0a",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 5px 15px rgba(255,215,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {loading ? "Logging in..." : "🔐 Login"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,215,0,0.2)",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "11px" }}>
            Demo Credentials:
            <br />
            admin@ibraaj.com
            <br />
            admin123
          </p>
          <p style={{ color: "#9ca3af", fontSize: "10px", marginTop: "10px" }}>
            © 2026 IBRAAJ FITNESS
          </p>
        </div>
      </div>
    </div>
  );
}