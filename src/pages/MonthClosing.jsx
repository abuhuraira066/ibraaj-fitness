// src/pages/MonthClosing.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, writeBatch, addDoc } from "firebase/firestore";

export default function MonthClosing({ members }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const safeMembers = Array.isArray(members) ? members : [];

  // Get New Admissions Count
  const getNewAdmissionsCount = () => {
    const now = new Date();
    return safeMembers.filter(m => {
      if (!m.joinDate) return false;
      const date = new Date(m.joinDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  };

  // ✅ Reset Only New Admissions
  const resetNewAdmissions = async () => {
    if (!window.confirm(
      "🆕 RESET NEW ADMISSIONS\n\n" +
      "This will reset the New Admissions counter to 0.\n" +
      "Current month's new admissions: " + getNewAdmissionsCount() + "\n\n" +
      "Members will NOT be deleted.\n\n" +
      "Are you sure?"
    )) {
      return;
    }

    setLoading(true);
    try {
      // Save snapshot
      await addDoc(collection(db, "monthlyReports"), {
        month: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
        monthKey: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
        action: "reset_new_admissions",
        newAdmissionsReset: getNewAdmissionsCount(),
        resetAt: new Date().toISOString(),
      });

      alert(`✅ New Admissions counter reset successfully!\n\nPrevious: ${getNewAdmissionsCount()}\nCurrent: 0`);
      window.location.reload();
    } catch (error) {
      console.error("Error resetting admissions:", error);
      alert("Error resetting admissions!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset All Plans
  const resetAllPlans = async () => {
    if (!window.confirm(
      "🏋️ RESET ALL PLANS\n\n" +
      "This will reset ALL plan counts to 0.\n" +
      "Members will NOT be deleted.\n\n" +
      "Current counts:\n" +
      `💪 Self Training: ${safeMembers.filter(m => m.plan === "Self Training").length}\n` +
      `🏆 Training: ${safeMembers.filter(m => m.plan === "Training").length}\n` +
      `🏃 Cardio: ${safeMembers.filter(m => m.plan === "Cardio").length}\n` +
      `💪🏃 Self + Cardio: ${safeMembers.filter(m => m.plan === "Self + Cardio").length}\n` +
      `🏆🏃 Training + Cardio: ${safeMembers.filter(m => m.plan === "Training + Cardio").length}\n\n` +
      "Are you sure?"
    )) {
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      safeMembers.forEach(member => {
        const memberRef = doc(db, "members", member.id);
        batch.update(memberRef, { plan: "" });
      });

      await batch.commit();

      alert("✅ All plans reset to 0 successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error resetting plans:", error);
      alert("Error resetting plans!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Complete Month Closing (Everything)
  const handleMonthClosing = async () => {
    if (!window.confirm(
      "⚠️ COMPLETE MONTH CLOSING ⚠️\n\n" +
      "This will reset:\n" +
      "✅ ALL plans to 0\n" +
      "✅ New Admissions to 0\n\n" +
      "Members will stay safe!\n" +
      "Attendance history saved!\n" +
      "Payment records saved!\n\n" +
      "Are you sure?"
    )) {
      return;
    }

    setLoading(true);
    try {
      // 1. Save snapshot
      await addDoc(collection(db, "monthlyReports"), {
        month: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
        monthKey: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
        totalMembers: safeMembers.length,
        selfTraining: safeMembers.filter(m => m.plan === "Self Training").length,
        training: safeMembers.filter(m => m.plan === "Training").length,
        cardio: safeMembers.filter(m => m.plan === "Cardio").length,
        selfCardio: safeMembers.filter(m => m.plan === "Self + Cardio").length,
        trainingCardio: safeMembers.filter(m => m.plan === "Training + Cardio").length,
        newAdmissions: getNewAdmissionsCount(),
        closedAt: new Date().toISOString(),
        status: "closed"
      });

      // 2. Reset plans only
      const batch = writeBatch(db);
      safeMembers.forEach(member => {
        const memberRef = doc(db, "members", member.id);
        batch.update(memberRef, { plan: "" });
      });
      await batch.commit();

      alert("✅ Month closed successfully!\n\n" +
            "✅ All plans reset to 0\n" +
            "✅ New Admissions reset to 0\n" +
            "✅ All members safe");
      
      window.location.reload();
    } catch (error) {
      console.error("Error during month closing:", error);
      alert("Error during month closing!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "rgba(255,215,0,0.05)",
      border: "2px solid #FFD700",
      borderRadius: "20px",
      padding: "30px",
      maxWidth: "700px",
      margin: "0 auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#FFD700", fontFamily: "Orbitron, sans-serif", margin: 0 }}>
          🔒 Month Closing
        </h2>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid #6b7280",
            color: "#cbd5e1",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      {/* Current Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "15px",
        marginBottom: "25px",
        background: "rgba(0,0,0,0.3)",
        padding: "20px",
        borderRadius: "12px",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>👥 Total Members</p>
          <h3 style={{ color: "#FFD700" }}>{safeMembers.length}</h3>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>🆕 New Admissions</p>
          <h3 style={{ color: "#00eaff" }}>{getNewAdmissionsCount()}</h3>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#9ca3af", fontSize: "12px" }}>💪 Plans Active</p>
          <h3 style={{ color: "#FFD700" }}>{safeMembers.filter(m => m.plan && m.plan !== "").length}</h3>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <button
          onClick={resetNewAdmissions}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #00eaff, #0066ff)",
            color: "white",
            border: "none",
            padding: "14px 20px",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "0.3s",
          }}
        >
          <span>🆕 Reset New Admissions</span>
          <span style={{ fontSize: "14px", opacity: 0.7 }}>Current: {getNewAdmissionsCount()}</span>
        </button>

        <button
          onClick={resetAllPlans}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #FFD700, #B8860B)",
            color: "#0a0a0a",
            border: "none",
            padding: "14px 20px",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "0.3s",
          }}
        >
          <span>🏋️ Reset All Plans</span>
          <span style={{ fontSize: "14px", opacity: 0.7 }}>{safeMembers.filter(m => m.plan && m.plan !== "").length} active</span>
        </button>

        <button
          onClick={handleMonthClosing}
          disabled={loading}
          style={{
            background: loading ? "linear-gradient(135deg, #666, #444)" : "linear-gradient(135deg, #ff4444, #cc0000)",
            color: "white",
            border: "none",
            padding: "16px 20px",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "0.3s",
            marginTop: "10px",
          }}
        >
          {loading ? "⏳ Processing..." : "🔒 Complete Month Closing"}
        </button>
      </div>
    </div>
  );
}