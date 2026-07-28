import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function DailyReport() {
  const [entries, setEntries] = useState([]);

  // ✅ Firebase Collection Reference
  const dailyReportRef = collection(db, "dailyReports");

  // ✅ Fetch Entries Function
  const fetchEntries = async () => {
    try {
      const snapshot = await getDocs(dailyReportRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  // ✅ Delete Entry Function
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this entry?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "dailyReports", id));
      fetchEntries();
      alert("✅ Entry Deleted");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete");
    }
  };

  // ✅ Fetch entries on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

  // ✅ Calculate today's total
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = entries.filter(entry => entry.date === today);
  const todayTotal = todayEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          color: "#FFD700",
          marginBottom: "30px",
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 10px #FFD700",
        }}
      >
        📒 Daily Report
      </h1>

      {/* Summary */}
      <div
        style={{
          background: "rgba(0,255,153,0.08)",
          border: "1px solid #00ff99",
          borderRadius: "15px",
          padding: "25px",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#00ff99", marginBottom: "10px" }}>
          Today's Collection
        </h2>

        <h1
          style={{
            color: "#00ff99",
            fontSize: "42px",
            margin: 0,
          }}
        >
          Rs. {todayTotal.toLocaleString()}
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginTop: "10px" }}>
          {todayEntries.length} entries today
        </p>
      </div>

      {/* Entries Table */}
      <div
        style={{
          background: "rgba(255,215,0,0.05)",
          border: "1px solid rgba(255,215,0,0.3)",
          borderRadius: "15px",
          padding: "25px",
        }}
      >
        <h2
          style={{
            color: "#FFD700",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          📋 Today's Entries
        </h2>

        {todayEntries.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "25px",
            }}
          >
            No entries yet.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "white",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,215,0,0.15)",
                  }}
                >
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Member</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {todayEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={tdStyle}>{entry.time}</td>

                    <td style={tdStyle}>
                      <strong style={{ color: "#FFD700" }}>
                        {entry.name || entry.memberName || "Unknown"}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      {entry.memberType || "Existing Member"}
                    </td>

                    <td style={tdStyle}>
                      {entry.method || entry.paymentMethod || "Cash"}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        color: "#00ff99",
                        fontWeight: "bold",
                      }}
                    >
                      Rs. {entry.amount}
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          background: "#ff4444",
                          border: "none",
                          color: "white",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#cc0000";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#ff4444";
                        }}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "14px",
  borderBottom: "1px solid rgba(255,215,0,0.3)",
  textAlign: "left",
  color: "#FFD700",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};