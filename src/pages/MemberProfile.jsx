import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export default function MemberProfile() {  // ✅ "export default" hona chahiye
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    try {
      const memberDoc = await getDoc(doc(db, "members", id));
      if (memberDoc.exists()) {
        setMember({ id: memberDoc.id, ...memberDoc.data() });
      }

      const paymentsQuery = query(collection(db, "payments"), where("memberId", "==", id));
      const paymentsData = await getDocs(paymentsQuery);
      setPayments(paymentsData.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));

      const attendanceQuery = query(collection(db, "attendance"), where("memberId", "==", id));
      const attendanceData = await getDocs(attendanceQuery);
      setAttendance(attendanceData.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPKR = (amount) => {
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) return <div style={{ color: "#FFD700", textAlign: "center", padding: "50px" }}>Loading...</div>;
  if (!member) return <div style={{ color: "#ff4444", textAlign: "center", padding: "50px" }}>Member not found</div>;

  return (
    <div>
      <button
        onClick={() => navigate("/members")}
        style={{
          background: "rgba(255,215,0,0.1)",
          border: "1px solid #FFD700",
          color: "#FFD700",
          padding: "8px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Back to Members
      </button>

      <div style={{
        background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
        border: "2px solid #FFD700",
        borderRadius: "20px",
        padding: "30px",
        marginBottom: "30px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "64px", marginBottom: "10px" }}>🏋️</div>
        <h1 style={{ color: "#FFD700", marginBottom: "10px" }}>{member.name}</h1>
        <p style={{ color: "#9ca3af" }}>🆔 {member.memberId}</p>
        <p style={{ color: "#00ff88", marginTop: "10px" }}>📅 Joined: {member.joinDate}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", borderRadius: "15px", padding: "20px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>💰 Monthly Fee</h3>
          <h2 style={{ color: "#00ff88" }}>{formatPKR(member.monthlyFee)}</h2>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", borderRadius: "15px", padding: "20px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>✅ Total Paid</h3>
          <h2 style={{ color: "#00ff88" }}>{formatPKR(member.paidFee)}</h2>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", borderRadius: "15px", padding: "20px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>📅 Attendance</h3>
          <h2 style={{ color: "#00ff88" }}>{attendance.length}</h2>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", borderRadius: "15px", padding: "20px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>💪 Plan</h3>
          <h2 style={{ color: "#00ff88", fontSize: "18px" }}>{member.plan}</h2>
        </div>
      </div>

      <div style={{
        background: "rgba(255,215,0,0.05)",
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: "15px",
        padding: "25px",
        marginBottom: "30px",
      }}>
        <h2 style={{ color: "#FFD700", marginBottom: "20px" }}>💳 Payment History</h2>
        {payments.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center" }}>No payment records found</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {payments.map(payment => (
              <div key={payment.id} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                borderLeft: "3px solid #00ff88",
              }}>
                <span>📅 {payment.date}</span>
                <span style={{ color: "#00ff88", fontWeight: "bold" }}>{formatPKR(payment.amount)}</span>
                <span>💳 {payment.method}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        background: "rgba(255,215,0,0.05)",
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: "15px",
        padding: "25px",
      }}>
        <h2 style={{ color: "#FFD700", marginBottom: "20px" }}>📅 Attendance History</h2>
        {attendance.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center" }}>No attendance records found</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {attendance.map(record => (
              <div key={record.id} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                borderLeft: "3px solid #FFD700",
              }}>
                <span>✅ Present</span>
                <span>📅 {record.date?.toDate ? record.date.toDate().toLocaleDateString() : record.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}