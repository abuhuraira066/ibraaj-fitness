import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [searchQuery, searchType, attendance]);

  const fetchAttendance = async () => {
    try {
      const attendanceRef = collection(db, "attendance");
      const q = query(attendanceRef, orderBy("date", "desc"));
      const data = await getDocs(q);
      const records = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAttendance(records);
      setFilteredAttendance(records);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    if (!searchQuery.trim()) {
      setFilteredAttendance(attendance);
      return;
    }

    const filtered = attendance.filter(record => {
      if (searchType === "name") {
        return record.name?.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        return record.memberCardId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               record.memberId?.toLowerCase().includes(searchQuery.toLowerCase());
      }
    });
    setFilteredAttendance(filtered);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
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
        📅 Attendance Records
      </h1>

      {/* Search Bar */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{
              background: "#0a0a0a",
              border: "1px solid #FFD700",
              color: "#FFD700",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="name">🔍 Search by Name</option>
            <option value="id">🆔 Search by ID</option>
          </select>
          
          <input
            type="text"
            placeholder={searchType === "name" ? "Enter member name..." : "Enter ID (e.g., IBF-0001)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "300px",
              padding: "12px 18px",
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

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchType("name");
              }}
              style={{
                background: "rgba(255,68,68,0.15)",
                border: "1px solid #ff4444",
                color: "#ff4444",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ff4444";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,68,68,0.15)";
                e.currentTarget.style.color = "#ff4444";
              }}
            >
              ✖ Clear
            </button>
          )}
        </div>
        
        <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "10px" }}>
          📊 Found {filteredAttendance.length} record{filteredAttendance.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Loading attendance...</p>
      ) : filteredAttendance.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            padding: "50px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "15px",
          }}
        >
          {searchQuery ? (
            <>No matching attendance records found for "{searchQuery}" 😕</>
          ) : (
            <>
              Koi attendance record nahi hai 😕
              <br />
              Members page se "Present" button click karein.
            </>
          )}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredAttendance.map((record, index) => (
            <div
              key={record.id}
              style={{
                background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
                border: "1px solid #FFD700",
                borderRadius: "15px",
                padding: "20px",
                transition: "0.3s",
                animation: `fadeIn 0.3s ease ${index * 0.05}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "#FFD700";
                e.currentTarget.style.boxShadow = "0 5px 20px rgba(255,215,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.borderColor = "#FFD700";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ color: "#FFD700", margin: "0", fontSize: "18px" }}>
                  {record.name || "Unknown"}
                </h3>
                <span style={{ fontSize: "24px" }}>✅</span>
              </div>

              <p style={{ margin: "8px 0", color: "#cbd5e1" }}>
                🆔 {record.memberCardId || record.memberId || "—"}
              </p>
              <p style={{ margin: "8px 0", color: "#cbd5e1" }}>
                📞 {record.phone || "—"}
              </p>
              <p style={{ margin: "8px 0", color: "#cbd5e1" }}>
                💪 {record.plan || "—"}
              </p>
              <p style={{ margin: "8px 0", color: "#cbd5e1" }}>
                🟢 Status: <strong style={{ color: "#00ff99" }}>{record.status || "Present"}</strong>
              </p>

              <hr style={{ borderColor: "rgba(255,215,0,0.2)", margin: "15px 0" }} />

              <p
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                📅 {formatDate(record.date)}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0px);
            }
          }
        `}
      </style>
    </div>
  );
}