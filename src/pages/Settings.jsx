import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Settings() {
  const [gymName, setGymName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const settingsRef = doc(db, "settings", "gymInfo");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getDoc(settingsRef);
      if (data.exists()) {
        const info = data.data();
        setGymName(info.gymName || "");
        setOwnerName(info.ownerName || "");
        setPhone(info.phone || "");
        setAddress(info.address || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await setDoc(settingsRef, {
        gymName,
        ownerName,
        phone,
        address,
        updatedAt: new Date().toLocaleString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert("Error saving settings: " + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#9ca3af", padding: "50px" }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          color: "#FFD700",
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 10px #FFD700",
          marginBottom: "30px",
        }}
      >
        ⚙️ Settings
      </h1>

      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
          border: "2px solid #FFD700",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <span style={{ fontSize: "48px" }}>🏋️</span>
          <h2 style={{ color: "#FFD700", marginTop: "10px", fontFamily: "Cinzel, serif" }}>
            Gym Configuration
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>
            Update your gym profile information
          </p>
        </div>

        <input
          type="text"
          placeholder="🏋️ Gym Name"
          value={gymName}
          onChange={(e) => setGymName(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            background: "#0a0a0a",
            border: "1px solid #FFD700",
            color: "white",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <input
          type="text"
          placeholder="👤 Owner Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            background: "#0a0a0a",
            border: "1px solid #FFD700",
            color: "white",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <input
          type="text"
          placeholder="📞 Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            background: "#0a0a0a",
            border: "1px solid #FFD700",
            color: "white",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <input
          type="text"
          placeholder="📍 Gym Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "20px",
            background: "#0a0a0a",
            border: "1px solid #FFD700",
            color: "white",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {saved && (
          <div
            style={{
              background: "rgba(255,215,0,0.1)",
              border: "1px solid #FFD700",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
              marginBottom: "15px",
              color: "#FFD700",
            }}
          >
            ✅ Settings saved successfully!
          </div>
        )}

        <button
          onClick={saveSettings}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #FFD700, #B8860B)",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
            transition: "0.3s",
            color: "#0a0a0a",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 5px 20px rgba(255,215,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          💾 Save Settings
        </button>

        <hr style={{ borderColor: "rgba(255,215,0,0.2)", margin: "25px 0 15px" }} />

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#9ca3af", fontSize: "11px" }}>
            ⚡ IBRAAJ FITNESS GYM MANAGEMENT SYSTEM
          </p>
          <p style={{ color: "#6b7280", fontSize: "10px", marginTop: "5px" }}>
            Gold Edition v2.0 | Premium Theme
          </p>
        </div>
      </div>
    </div>
  );
}