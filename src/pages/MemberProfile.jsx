import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Receipt from "../components/Receipt";
import PaymentModal from "../components/PaymentModal";

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      console.log("🔍 Fetching member with memberId:", id);
      
      const membersRef = collection(db, "members");
      const q = query(membersRef, where("memberId", "==", id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const memberData = { id: doc.id, ...doc.data() };
        console.log("✅ Member found:", memberData);
        setMember(memberData);
      } else {
        console.error("❌ Member not found with memberId:", id);
        setLoading(false);
        return;
      }

      try {
        const paymentsQuery = query(collection(db, "payments"), where("memberCardId", "==", id));
        const paymentsData = await getDocs(paymentsQuery);
        setPayments(paymentsData.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error("Error fetching payments:", err);
      }

      try {
        const attendanceQuery = query(collection(db, "attendanceHistory"), where("memberCardId", "==", id));
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

  const handlePrint = () => {
    const receipt = document.getElementById("receipt");
    if (!receipt) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>IBRAAJ FITNESS Receipt</title>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; }
            #receipt {
              width: 700px;
              margin: 20px auto;
              background: #fff;
              color: #000;
              padding: 30px;
              border: 2px solid #000;
              border-radius: 8px;
            }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px 5px; border-bottom: 1px solid #eee; }
            td:first-child { font-weight: bold; color: #555; width: 40%; }
            td:last-child { text-align: right; }
            hr { border: 1px solid #000; margin: 15px 0; }
            .header { text-align: center; }
            .header h1 { margin-bottom: 0; color: #000; }
            .header h3 { margin-top: 5px; color: #333; }
            .footer { text-align: center; margin-top: 20px; }
            .footer h3 { margin: 5px 0; }
            .status-paid { color: #00a651; font-weight: bold; }
            .status-unpaid { color: #ff0000; font-weight: bold; }
            @media print {
              body { margin: 0; padding: 0; }
              #receipt { 
                border: 2px solid #000; 
                border-radius: 0;
                margin: 0 auto;
                width: 100%;
                max-width: 700px;
                box-shadow: none;
              }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${receipt.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
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

  const getRemainingDays = (dueDate) => {
    if (!dueDate) return { text: "Not Set", color: "#9ca3af", type: "not-set" };
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return { text: `${diffDays} Days Left`, color: "#00ff88", type: "upcoming" };
    if (diffDays === 0) return { text: "Due Today", color: "#ffcc00", type: "today" };
    return { text: `${Math.abs(diffDays)} Days Overdue`, color: "#ff4444", type: "overdue" };
  };

  const getPaymentStatusMessage = () => {
    if (!member) return { text: "", color: "#9ca3af", icon: "" };
    const monthly = Number(member.monthlyFee) || 0;
    const paid = Number(member.paidFee) || 0;
    if (member.feeStatus === "Paid") {
      return { text: "✅ Payment Completed! Next due in 30 days", color: "#00ff88", icon: "✅" };
    } else if (paid > 0 && paid < monthly) {
      const remaining = monthly - paid;
      return { text: `⚠️ Partial Payment: PKR ${remaining.toLocaleString()} remaining`, color: "#ffcc00", icon: "⚠️" };
    } else {
      return { text: "❌ No payment received yet", color: "#ff4444", icon: "❌" };
    }
  };

  const remainingDays = getRemainingDays(member?.dueDate);
  const paymentStatus = getPaymentStatusMessage();

  if (loading) return <div style={{ color: "#FFD700", textAlign: "center", padding: "50px" }}>Loading member details...</div>;
  if (!member) return <div style={{ color: "#ff4444", textAlign: "center", padding: "50px" }}>Member not found! Please go back and try again.</div>;

  return (
    <div>
      <button
        onClick={handlePrint}
        style={{
          background: "linear-gradient(135deg, #FFD700, #B8860B)",
          color: "#0a0a0a",
          border: "none",
          padding: "12px 24px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "15px",
          transition: "0.3s",
          boxShadow: "0 2px 10px rgba(255,215,0,0.3)",
          marginBottom: "20px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🧾 Print Receipt
      </button>

      <button
        onClick={() => setShowPaymentModal(true)}
        style={{
          background: "linear-gradient(135deg,#00c853,#009624)",
          color: "#fff",
          border: "none",
          padding: "12px 24px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "15px",
          transition: "0.3s",
          boxShadow: "0 2px 10px rgba(0,200,83,0.3)",
          marginBottom: "20px",
          marginLeft: "10px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        💰 Receive Payment
      </button>

      <Receipt member={member} />

      {/* ✅ Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        member={member}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={fetchMemberData}
      />

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
            <p style={{ fontSize: "18px", fontWeight: "bold", color: remainingDays.color }}>{member.dueDate || "Not Set"}</p>
          </div>
          <div>
            <h3 style={{ color: "#FFD700", marginBottom: "10px" }}>⏳ Status</h3>
            <p style={{ fontSize: "18px", fontWeight: "bold", color: remainingDays.color }}>{remainingDays.text}</p>
          </div>
          <div>
            <h3 style={{ color: "#FFD700", marginBottom: "10px" }}>💳 Payment Status</h3>
            <p style={{ fontSize: "14px", fontWeight: "bold", color: paymentStatus.color }}>{paymentStatus.icon} {paymentStatus.text}</p>
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
                <span>📅 {formatDate(record.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}