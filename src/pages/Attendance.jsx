import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function Attendance() {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const attendanceRef = collection(db, "attendanceHistory");
      const q = query(attendanceRef, orderBy("timestamp", "desc"));
      const data = await getDocs(q);
      const records = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAttendanceHistory(records);
      
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = records.filter(record => record.date === today);
      setTodayAttendance(todayRecords);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setLoading(false);
    }
  };

  const filterByDate = () => {
    if (!selectedDate) return attendanceHistory;
    return attendanceHistory.filter(record => record.date === selectedDate);
  };

  const filteredHistory = filterByDate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <h1
        style={{
          color: "#FFD700",
          textAlign: "center",
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 10px #FFD700",
          marginBottom: "30px",
        }}
      >
        📅 Attendance Management
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
          borderBottom: "1px solid rgba(255,215,0,0.3)",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => setActiveTab("today")}
          style={{
            background: activeTab === "today" ? "linear-gradient(135deg, #FFD700, #B8860B)" : "transparent",
            border: activeTab === "today" ? "none" : "1px solid #FFD700",
            color: activeTab === "today" ? "#0a0a0a" : "#FFD700",
            padding: "10px 25px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📅 Present Today ({todayAttendance.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            background: activeTab === "history" ? "linear-gradient(135deg, #FFD700, #B8860B)" : "transparent",
            border: activeTab === "history" ? "none" : "1px solid #FFD700",
            color: activeTab === "history" ? "#0a0a0a" : "#FFD700",
            padding: "10px 25px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📚 Attendance History ({attendanceHistory.length})
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading attendance...</p>
      ) : activeTab === "today" ? (
        <div>
          <div
            style={{
              background: "rgba(255,215,0,0.05)",
              border: "1px solid rgba(255,215,0,0.3)",
              borderRadius: "15px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#FFD700", marginBottom: "10px" }}>📅 Today's Attendance</h2>
            <p style={{ color: "#9ca3af" }}>
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p style={{ color: "#00ff88", fontSize: "18px", fontWeight: "bold" }}>
              Total Present: {todayAttendance.length}
            </p>
          </div>

          {todayAttendance.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "50px", background: "rgba(255,255,255,0.02)", borderRadius: "15px" }}>
              Koi member present nahi hai aaj 😕
              <br />Members page se "Present" button click karein.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {todayAttendance.map((record, index) => (
                <div key={record.id} style={{ background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: "1px solid #FFD700", borderRadius: "15px", padding: "20px", transition: "0.3s", animation: `fadeIn 0.3s ease ${index * 0.05}s` }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#FFD700"; e.currentTarget.style.boxShadow = "0 5px 20px rgba(255,215,0,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px)"; e.currentTarget.style.borderColor = "#FFD700"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ color: "#FFD700", margin: "0", fontSize: "18px" }}>{record.name || "Unknown"}</h3>
                    <span style={{ fontSize: "24px" }}>✅</span>
                  </div>
                  <p style={{ margin: "8px 0", color: "#cbd5e1" }}>🆔 {record.memberCardId || record.memberId || "—"}</p>
                  <p style={{ margin: "8px 0", color: "#cbd5e1" }}>📞 {record.phone || "—"}</p>
                  <p style={{ margin: "8px 0", color: "#cbd5e1" }}>💪 {record.plan || "—"}</p>
                  <hr style={{ borderColor: "rgba(255,215,0,0.2)", margin: "15px 0" }} />
                  <p style={{ textAlign: "center", color: "#00ff88", fontSize: "12px", fontWeight: "bold" }}>✅ Present Today</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
            <h2 style={{ color: "#FFD700", marginBottom: "15px" }}>📚 Attendance History</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px 18px", borderRadius: "10px", fontSize: "14px", outline: "none" }} />
              {selectedDate && <button onClick={() => setSelectedDate("")} style={{ background: "rgba(255,68,68,0.15)", border: "1px solid #ff4444", color: "#ff4444", padding: "12px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}>✖ Clear Filter</button>}
            </div>
            <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "10px" }}>Found {filteredHistory.length} records</p>
          </div>

          {filteredHistory.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "50px", background: "rgba(255,255,255,0.02)", borderRadius: "15px" }}>
              {selectedDate ? `No attendance records found for ${formatDate(selectedDate)} 😕` : "No attendance records found 😕"}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {filteredHistory.map((record, index) => (
                <div key={record.id} style={{ background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "20px", transition: "0.3s", animation: `fadeIn 0.3s ease ${index * 0.05}s` }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#FFD700"; e.currentTarget.style.boxShadow = "0 5px 20px rgba(255,215,0,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px)"; e.currentTarget.style.borderColor = "rgba(255,215,0,0.3)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ color: "#FFD700", margin: "0", fontSize: "18px" }}>{record.name || "Unknown"}</h3>
                    <span style={{ fontSize: "24px" }}>✅</span>
                  </div>
                  <p style={{ margin: "8px 0", color: "#cbd5e1" }}>🆔 {record.memberCardId || record.memberId || "—"}</p>
                  <p style={{ margin: "8px 0", color: "#cbd5e1" }}>📞 {record.phone || "—"}</p>
                  <p style={{ margin: "8px 0", color: "#cbd5e1" }}>💪 {record.plan || "—"}</p>
                  <hr style={{ borderColor: "rgba(255,215,0,0.2)", margin: "15px 0" }} />
                  <p style={{ textAlign: "center", color: "#FFD700", fontSize: "12px" }}>📅 {formatDate(record.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}