import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMemberData();
    } else {
      console.error("No member ID provided");
      setLoading(false);
    }
  }, [id]);

  const fetchMemberData = async () => {
    try {
      console.log("Fetching member with ID:", id);
      
      // Fetch member details
      const memberDoc = await getDoc(doc(db, "members", id));
      console.log("Member doc exists:", memberDoc.exists());
      
      if (memberDoc.exists()) {
        setMember({ id: memberDoc.id, ...memberDoc.data() });
      } else {
        console.error("Member not found in database");
        setLoading(false);
        return;
      }

      // Fetch payment history
      try {
        const paymentsQuery = query(collection(db, "payments"), where("memberId", "==", id));
        const paymentsData = await getDocs(paymentsQuery);
        setPayments(paymentsData.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error("Error fetching payments:", err);
      }

      // Fetch attendance history
      try {
        const attendanceQuery = query(collection(db, "attendanceHistory"), where("memberId", "==", id));
        const attendanceData = await getDocs(attendanceQuery);
        setAttendance(attendanceData.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
      
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Calculate Remaining Days for Due Date
  const getRemainingDays = (dueDate) => {
    if (!dueDate) return { text: "Not Set", color: "#9ca3af", type: "not-set" };
    
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { text: `${diffDays} Days Left`, color: "#00ff88", type: "upcoming" };
    } else if (diffDays === 0) {
      return { text: "Due Today", color: "#ffcc00", type: "today" };
    } else {
      return { text: `${Math.abs(diffDays)} Days Overdue`, color: "#ff4444", type: "overdue" };
    }
  };

  const getPaymentStatusMessage = () => {
    if (!member) return { text: "", color: "#9ca3af", icon: "" };
    
    const monthly = Number(member.monthlyFee) || 0;
    const paid = Number(member.paidFee) || 0;
    
    if (member.feeStatus === "Paid") {
      return {
        text: "✅ Payment Completed! Next due in 30 days",
        color: "#00ff88",
        icon: "✅"
      };
    } else if (paid > 0 && paid < monthly) {
      const remaining = monthly - paid;
      return {
        text: `⚠️ Partial Payment: PKR ${remaining.toLocaleString()} remaining`,
        color: "#ffcc00",
        icon: "⚠️"
      };
    } else {
      return {
        text: "❌ No payment received yet",
        color: "#ff4444",
        icon: "❌"
      };
    }
  };

  const remainingDays = getRemainingDays(member?.dueDate);
  const paymentStatus = getPaymentStatusMessage();

  if (loading) return <div style={{ color: "#FFD700", textAlign: "center", padding: "50px" }}>Loading member details...</div>;
  if (!member) return <div style={{ color: "#ff4444", textAlign: "center", padding: "50px" }}>Member not found! Please go back and try again.</div>;

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

      {/* Stats Grid */}
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

      {/* Due Date & Remaining Days Section */}
      <div style={{
        background: "rgba(255,215,0,0.08)",
        border: `2px solid ${remainingDays.color}`,
        borderRadius: "15px",
        padding: "20px",
        marginBottom: "30px",
        textAlign: "center",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <h3 style={{ color: "#FFD700", marginBottom: "10px" }}>📅 Due Date</h3>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: remainingDays.color }}>
              {member.dueDate || "Not Set"}
            </p>
          </div>
          <div>
            <h3 style={{ color: "#FFD700", marginBottom: "10px" }}>⏳ Status</h3>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: remainingDays.color }}>
              {remainingDays.text}
            </p>
          </div>
          <div>
            <h3 style={{ color: "#FFD700", marginBottom: "10px" }}>💳 Payment Status</h3>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: paymentStatus.color }}>
              {paymentStatus.icon} {paymentStatus.text}
            </p>
          </div>
        </div>
        
        {remainingDays.type === "overdue" && (
          <div style={{ marginTop: "15px", padding: "10px", background: "rgba(255,68,68,0.1)", borderRadius: "10px" }}>
            <p style={{ color: "#ff4444" }}>⚠️ Please collect payment immediately! Fee is overdue.</p>
          </div>
        )}
        
        {remainingDays.type === "today" && (
          <div style={{ marginTop: "15px", padding: "10px", background: "rgba(255,204,0,0.1)", borderRadius: "10px" }}>
            <p style={{ color: "#ffcc00" }}>⚠️ Fee is due today! Please collect payment.</p>
          </div>
        )}
        
        {remainingDays.type === "upcoming" && remainingDays.text !== "Not Set" && (
          <div style={{ marginTop: "15px", padding: "10px", background: "rgba(0,255,136,0.05)", borderRadius: "10px" }}>
            <p style={{ color: "#00ff88" }}>✅ Payment is due in {remainingDays.text.split(" ")[0]} days.</p>
          </div>
        )}
      </div>

      {/* Payment History */}
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

      {/* Attendance History */}
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
                <span>📅 {formatDate(record.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}