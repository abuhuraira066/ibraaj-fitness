import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("Self Training");
  const [feeStatus, setFeeStatus] = useState("Unpaid");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [paidFee, setPaidFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const membersRef = collection(db, "members");
  const expensesRef = collection(db, "expenses");

  // 🕒 Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMembers = async () => {
    const data = await getDocs(membersRef);
    setMembers(
      data.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      }))
    );
  };

  const fetchExpenses = async () => {
    const data = await getDocs(expensesRef);
    setExpenses(
      data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
    );
  };

  useEffect(() => {
    fetchMembers();
    fetchExpenses();
  }, []);

  const dueTodayCount = members.filter(
    (m) =>
      m.feeStatus === "Unpaid" &&
      m.dueDate &&
      new Date(m.dueDate) <= new Date()
  ).length;

  const totalIncome = members.reduce(
    (sum, m) => sum + Number(m.paidFee || 0), 0
  );
  const totalPending = members.reduce(
    (sum, m) =>
      sum +
      (Number(m.totalFee || 0) -
        Number(m.paidFee || 0) -
        Number(m.discount || 0)),
    0
  );
  const totalExpense = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0), 0
  );
  const netProfit = totalIncome - totalExpense;

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      (m.memberId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMember = async () => {
    if (!name || !phone) {
      alert("Name aur Phone likho");
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "members", editingId), {
        name, phone, plan, feeStatus,
        monthlyFee, totalFee, paidFee, discount, dueDate,
        remainingFee:
          Number(totalFee || 0) - Number(paidFee || 0) - Number(discount || 0),
      });
      alert("Member Updated");
      setEditingId(null);
    } else {
      const memberId = `IBF-${String(members.length + 1).padStart(4, "0")}`;
      await addDoc(membersRef, {
        memberId, name, phone, plan, feeStatus,
        monthlyFee, totalFee, paidFee, discount, dueDate,
        remainingFee:
          Number(totalFee || 0) - Number(paidFee || 0) - Number(discount || 0),
        joinDate: new Date().toLocaleDateString(),
        status: "active",
      });
      alert("Member Added — ID: " + memberId);
    }

    setName(""); setPhone(""); setPlan("Self Training"); setFeeStatus("Unpaid");
    setMonthlyFee(""); setTotalFee(""); setPaidFee("");
    setDiscount(""); setDueDate("");
    fetchMembers();
  };

  const deleteMember = async (id) => {
    await deleteDoc(doc(db, "members", id));
    fetchMembers();
  };

  const markAttendance = async (member) => {
    await addDoc(collection(db, "attendance"), {
      memberId: member.id,
      memberCardId: member.memberId,
      name: member.name,
      phone: member.phone,
      plan: member.plan,
      status: "Present",
      date: serverTimestamp(),
    });
    alert(member.name + " marked Present");
  };

  const addExpense = async () => {
    if (!expenseName || !expenseAmount) {
      alert("Expense Name aur Amount likho");
      return;
    }
    await addDoc(expensesRef, {
      title: expenseName,
      amount: Number(expenseAmount),
      date: new Date().toLocaleDateString(),
    });
    setExpenseName(""); setExpenseAmount("");
    fetchExpenses();
    alert("Expense Added");
  };

  // 📅 Date & Time formatting
  const todayStr = currentTime.toLocaleDateString("en-GB").replace(/\//g, "/");
  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });
  const monthYear = currentTime.toLocaleString("en-US", {
    month: "long", year: "numeric",
  });

  // Format PKR
  const formatPKR = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="app-container" style={{
      background: "linear-gradient(135deg,#020617,#0f172a,#111827)",
      minHeight: "100vh",
      padding: "35px",
      maxWidth: "1700px",
      margin: "auto",
    }}>

      {/* Neon Title */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h1 style={{
          margin: "0",
          fontSize: "52px",
          fontFamily: "Orbitron, sans-serif",
          color: "#00eaff",
          letterSpacing: "4px",
          textShadow: "0 0 10px #00eaff, 0 0 25px #00eaff, 0 0 50px #00eaff"
        }}>
          🏋️ IBRAAJ FITNESS
        </h1>
        <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: "15px" }}>
          📅 Today : {todayStr} &nbsp;|&nbsp; 🕒 Time : {timeStr}
        </p>
      </div>

      <hr style={{ borderColor: "#374151", margin: "15px 0 25px" }} />

      {/* Dashboard Cards - Premium Layout with PKR */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)", transition: "0.3s", padding: "20px", width: "220px", height: "130px", borderRadius: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>Total Members</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff", margin: "5px 0 0" }}>{members.length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)", transition: "0.3s", padding: "20px", width: "220px", height: "130px", borderRadius: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>Active</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff", margin: "5px 0 0" }}>{members.filter((m) => m.status === "active").length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)", transition: "0.3s", padding: "20px", width: "220px", height: "130px", borderRadius: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>Paid</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff", margin: "5px 0 0" }}>{members.filter((m) => m.feeStatus === "Paid").length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)", transition: "0.3s", padding: "20px", width: "220px", height: "130px", borderRadius: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>Unpaid</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff", margin: "5px 0 0" }}>{members.filter((m) => m.feeStatus === "Unpaid").length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)", transition: "0.3s", padding: "20px", width: "220px", height: "130px", borderRadius: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>Self Training</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff", margin: "5px 0 0" }}>{members.filter((m) => m.plan === "Self Training").length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)", transition: "0.3s", padding: "20px", width: "220px", height: "130px", borderRadius: "10px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>Training</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff", margin: "5px 0 0" }}>{members.filter((m) => m.plan === "Training").length}</h1>
        </div>
        <div style={{
          background: dueTodayCount > 0 ? "rgba(255,0,0,0.15)" : "rgba(255,255,255,0.05)",
          backdropFilter: "blur(18px)",
          border: dueTodayCount > 0 ? "1px solid rgba(255,0,0,.5)" : "1px solid rgba(0,234,255,.25)",
          boxShadow: dueTodayCount > 0 ? "0 0 20px rgba(255,0,0,.3)" : "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)",
          transition: "0.3s",
          padding: "20px",
          width: "220px",
          height: "130px",
          borderRadius: "10px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <h3 style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>⚠️ Fees Due</h3>
          <h1 style={{ fontSize: "42px", color: dueTodayCount > 0 ? "#ff4444" : "#00eaff", margin: "5px 0 0" }}>{dueTodayCount}</h1>
        </div>
      </div>

      {/* Form with Glassmorphism - Updated Plans */}
      <div style={{ textAlign: "center" }}>
        <input type="text" placeholder="Member Name" value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "170px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <input type="text" placeholder="Phone Number" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "170px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        
        {/* Updated Plan Select - 5 Plans */}
        <select value={plan} onChange={(e) => setPlan(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }}>
          <option style={{ background: "#111827" }}>Self Training</option>
          <option style={{ background: "#111827" }}>Training</option>
          <option style={{ background: "#111827" }}>Cardio</option>
          <option style={{ background: "#111827" }}>Self + Cardio</option>
          <option style={{ background: "#111827" }}>Training + Cardio</option>
        </select>
        
        <select value={feeStatus} onChange={(e) => setFeeStatus(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }}>
          <option style={{ background: "#111827" }}>Paid</option>
          <option style={{ background: "#111827" }}>Unpaid</option>
        </select>
        <input type="number" placeholder="Monthly Fee (PKR)" value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Total Fee (PKR)" value={totalFee}
          onChange={(e) => setTotalFee(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Paid Fee (PKR)" value={paidFee}
          onChange={(e) => setPaidFee(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Discount (PKR)" value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "160px", marginBottom: "10px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <br />
        <button onClick={addMember} style={{
          padding: "10px 20px",
          background: editingId ? "linear-gradient(135deg,#ffb300,#ff7300)" : "linear-gradient(135deg,#00eaff,#0066ff)",
          boxShadow: editingId ? "0 8px 20px rgba(255,179,0,.4)" : "0 8px 20px rgba(0,234,255,.4)",
          transform: "translateY(0px)",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
          marginTop: "10px",
          fontWeight: "bold",
          transition: "transform 0.2s, box-shadow 0.2s"
        }}
        onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 25px rgba(0,234,255,.5)"; }}
        onMouseLeave={(e) => { e.target.style.transform = "translateY(0px)"; e.target.style.boxShadow = editingId ? "0 8px 20px rgba(255,179,0,.4)" : "0 8px 20px rgba(0,234,255,.4)"; }}>
          {editingId ? "Update Member" : "Add Member"}
        </button>
        {editingId && (
          <button onClick={() => {
            setEditingId(null); setName(""); setPhone(""); setPlan("Self Training");
            setFeeStatus("Unpaid"); setMonthlyFee(""); setTotalFee("");
            setPaidFee(""); setDiscount(""); setDueDate("");
          }} style={{
            padding: "10px 20px",
            background: "#6b7280",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            marginLeft: "10px",
            marginTop: "10px",
          }}>
            Cancel
          </button>
        )}
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Premium Search Box */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input type="text" placeholder="🔍 Search by Name / Phone / ID..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "12px 20px",
            width: "350px",
            borderRadius: "12px",
            border: "2px solid rgba(0,234,255,.3)",
            background: "rgba(255,255,255,.05)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 20px rgba(0,234,255,.2)",
            color: "white",
            fontSize: "16px",
            outline: "none",
            transition: "all 0.3s"
          }}
          onFocus={(e) => { e.target.style.borderColor = "#00eaff"; e.target.style.boxShadow = "0 0 30px rgba(0,234,255,.4)"; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(0,234,255,.3)"; e.target.style.boxShadow = "0 0 20px rgba(0,234,255,.2)"; }} />
      </div>

      <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif" }}>
        👥 Members List{" "}
        <span style={{ fontSize: "16px", color: "#9ca3af" }}>({filteredMembers.length} found)</span>
      </h2>

      {filteredMembers.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Koi member nahi mila 😕</p>
      ) : (
        filteredMembers.map((member) => {
          const remaining =
            Number(member.totalFee || 0) -
            Number(member.paidFee || 0) -
            Number(member.discount || 0);
          const isDue =
            member.feeStatus === "Unpaid" &&
            member.dueDate &&
            new Date(member.dueDate) <= new Date();

          return (
            <div key={member.id} style={{
              background: editingId === member.id ? "rgba(255,179,0,0.15)" : "rgba(255,255,255,0.05)",
              backdropFilter: "blur(18px)",
              border: editingId === member.id ? "1px solid rgba(255,179,0,.5)" : (isDue ? "1px solid rgba(255,0,0,.5)" : "1px solid rgba(0,234,255,.25)"),
              boxShadow: "0 15px 35px rgba(0,0,0,.35), 0 0 20px rgba(0,234,255,.15)",
              transition: "0.3s",
              borderRadius: "16px",
              padding: "25px",
              marginBottom: "20px",
              textAlign: "center",
            }}>
              {/* ID Badge */}
              <div style={{
                display: "inline-block",
                background: "rgba(0,234,255,0.15)",
                color: "#00eaff",
                padding: "4px 20px",
                borderRadius: "30px",
                fontSize: "13px",
                fontWeight: "bold",
                letterSpacing: "1px",
                marginBottom: "10px",
                border: "1px solid rgba(0,234,255,.3)"
              }}>
                🆔 {member.memberId || "—"}
              </div>

              <h2 style={{ margin: "8px 0", fontFamily: "Orbitron, sans-serif" }}>👤 {member.name}</h2>
              <p>📞 {member.phone}</p>
              <p>📅 Join Date : {member.joinDate || "—"}</p>
              <p>💪 {member.plan}</p>
              <p>🟢 {member.status}</p>

              <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "15px 0" }} />

              <p>💳 Fee Status : <strong style={{ color: member.feeStatus === "Paid" ? "#00ff99" : "#ff4444" }}>{member.feeStatus}</strong></p>
              <p>📅 Due Date : {member.dueDate || "—"}</p>
              <p>📅 Monthly Fee : {formatPKR(member.monthlyFee || 0)}</p>
              <p>💰 Total Fee : {formatPKR(member.totalFee || 0)}</p>
              <p>✅ Paid Fee : {formatPKR(member.paidFee || 0)}</p>
              <p>🎁 Discount : {formatPKR(member.discount || 0)}</p>
              <p>❌ Remaining : {formatPKR(remaining)}</p>

              {isDue ? (
                <h3 style={{ color: "#ff4444", textShadow: "0 0 10px rgba(255,0,0,.5)" }}>⚠️ Fee Due</h3>
              ) : (
                <h3 style={{ color: "#00ff99", textShadow: "0 0 10px rgba(0,255,153,.5)" }}>✅ Fees Cleared</h3>
              )}

              <div style={{ marginTop: "20px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => {
                  setEditingId(member.id); setName(member.name); setPhone(member.phone);
                  setPlan(member.plan); setFeeStatus(member.feeStatus);
                  setMonthlyFee(member.monthlyFee || ""); setTotalFee(member.totalFee || "");
                  setPaidFee(member.paidFee || ""); setDiscount(member.discount || "");
                  setDueDate(member.dueDate || "");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} style={{
                  background: "linear-gradient(135deg,#ffb300,#ff7300)",
                  boxShadow: "0 8px 20px rgba(255,179,0,.4)",
                  transform: "translateY(0px)",
                  color: "white",
                  border: "none",
                  padding: "10px 25px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "0.2s"
                }}
                onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 25px rgba(255,179,0,.5)"; }}
                onMouseLeave={(e) => { e.target.style.transform = "translateY(0px)"; e.target.style.boxShadow = "0 8px 20px rgba(255,179,0,.4)"; }}>
                  ✏️ Edit
                </button>
                <button onClick={() => markAttendance(member)}
                  style={{
                    background: "linear-gradient(135deg,#00ff99,#00b86b)",
                    boxShadow: "0 8px 20px rgba(0,255,153,.4)",
                    transform: "translateY(0px)",
                    color: "white",
                    border: "none",
                    padding: "10px 25px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "0.2s"
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 25px rgba(0,255,153,.5)"; }}
                  onMouseLeave={(e) => { e.target.style.transform = "translateY(0px)"; e.target.style.boxShadow = "0 8px 20px rgba(0,255,153,.4)"; }}>
                  ✅ Present
                </button>
                <button onClick={() => deleteMember(member.id)}
                  style={{
                    background: "linear-gradient(135deg,#ff004d,#ff4d4d)",
                    boxShadow: "0 8px 20px rgba(255,0,77,.4)",
                    transform: "translateY(0px)",
                    color: "white",
                    border: "none",
                    padding: "10px 25px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "0.2s"
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 25px rgba(255,0,77,.5)"; }}
                  onMouseLeave={(e) => { e.target.style.transform = "translateY(0px)"; e.target.style.boxShadow = "0 8px 20px rgba(255,0,77,.4)"; }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* ============ 5 PLAN SECTIONS ============ */}

      {/* 💪 Self Training Members - ONLY Self Training */}
      <hr style={{ margin: "40px 0", borderColor: "rgba(0,234,255,.2)" }} />
      <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif" }}>💪 Self Training Members</h2>
      {members.filter((m) => m.plan === "Self Training").length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Koi Self Training member nahi 😕</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
          {members.filter((m) => m.plan === "Self Training").map((member) => (
            <div key={"self" + member.id}
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35)", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px" }}>
              <h3 style={{ color: "#00eaff" }}>{member.memberId}</h3>
              <p><strong>{member.name}</strong></p>
              <p>{member.phone}</p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>{member.plan}</p>
            </div>
          ))}
        </div>
      )}

      {/* 🏆 Training Members - ONLY Training */}
      <hr style={{ margin: "40px 0", borderColor: "rgba(0,234,255,.2)" }} />
      <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif" }}>🏆 Training Members</h2>
      {members.filter((m) => m.plan === "Training").length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Koi Training member nahi 😕</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
          {members.filter((m) => m.plan === "Training").map((member) => (
            <div key={"training" + member.id}
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35)", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px" }}>
              <h3 style={{ color: "#00eaff" }}>{member.memberId}</h3>
              <p><strong>{member.name}</strong></p>
              <p>{member.phone}</p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>{member.plan}</p>
            </div>
          ))}
        </div>
      )}

      {/* 🏃 Cardio Only Members */}
      <hr style={{ margin: "40px 0", borderColor: "rgba(0,234,255,.2)" }} />
      <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif" }}>🏃 Cardio Members</h2>
      {members.filter((m) => m.plan === "Cardio").length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Koi Cardio member nahi 😕</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
          {members.filter((m) => m.plan === "Cardio").map((member) => (
            <div key={"cardio" + member.id}
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", boxShadow: "0 15px 35px rgba(0,0,0,.35)", padding: "20px", borderRadius: "12px", textAlign: "center", minWidth: "200px" }}>
              <h3 style={{ color: "#00eaff" }}>{member.memberId}</h3>
              <p><strong>{member.name}</strong></p>
              <p>{member.phone}</p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>{member.plan}</p>
            </div>
          ))}
        </div>
      )}

      {/* 💪🏃 Self + Cardio Members - NEW SECTION */}
      <hr style={{ margin: "40px 0", borderColor: "rgba(0,234,255,.2)" }} />
      <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif", marginTop: "40px" }}>
        💪🏃 Self + Cardio Members
      </h2>
      {members.filter((m) => m.plan === "Self + Cardio").length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>
          Koi Self + Cardio member nahi 😳
        </p>
      ) : (
        <div style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {members
            .filter((m) => m.plan === "Self + Cardio")
            .map((member) => (
              <div
                key={member.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(18px)",
                  padding: "20px",
                  borderRadius: "12px",
                  width: "220px",
                  textAlign: "center",
                  border: "1px solid #00ff66",
                  boxShadow: "0 0 15px rgba(0,255,102,.15)"
                }}
              >
                <h3 style={{ color: "#00eaff" }}>{member.memberId}</h3>
                <p><strong>{member.name}</strong></p>
                <p>{member.phone}</p>
                <p style={{ fontSize: "12px", color: "#00ff66" }}>{member.plan}</p>
              </div>
            ))}
        </div>
      )}

      {/* 🏆🏃 Training + Cardio Members - NEW SECTION */}
      <hr style={{ margin: "40px 0", borderColor: "rgba(0,234,255,.2)" }} />
      <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif", marginTop: "40px" }}>
        🏆🏃 Training + Cardio Members
      </h2>
      {members.filter((m) => m.plan === "Training + Cardio").length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>
          Koi Training + Cardio member nahi 😳
        </p>
      ) : (
        <div style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {members
            .filter((m) => m.plan === "Training + Cardio")
            .map((member) => (
              <div
                key={member.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(18px)",
                  padding: "20px",
                  borderRadius: "12px",
                  width: "220px",
                  textAlign: "center",
                  border: "1px solid #0099ff",
                  boxShadow: "0 0 15px rgba(0,153,255,.15)"
                }}
              >
                <h3 style={{ color: "#00eaff" }}>{member.memberId}</h3>
                <p><strong>{member.name}</strong></p>
                <p>{member.phone}</p>
                <p style={{ fontSize: "12px", color: "#0099ff" }}>{member.plan}</p>
              </div>
            ))}
        </div>
      )}

      {/* Accounts Section with PKR */}
      <hr style={{ margin: "40px 0", borderColor: "rgba(0,234,255,.2)" }} />
      <h1 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif", color: "#00eaff", textShadow: "0 0 10px #00eaff" }}>💰 Accounts (PKR)</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input placeholder="Expense Name" value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "200px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Amount (PKR)" value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          style={{ padding: "10px", marginRight: "10px", width: "150px", background: "rgba(255,255,255,.05)", backdropFilter: "blur(10px)", border: "2px solid rgba(0,234,255,.3)", borderRadius: "8px", color: "white" }} />
        <button onClick={addExpense} style={{
          padding: "10px 25px",
          background: "linear-gradient(135deg,#00eaff,#0066ff)",
          boxShadow: "0 8px 20px rgba(0,234,255,.4)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "0.2s"
        }}
        onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 25px rgba(0,234,255,.5)"; }}
        onMouseLeave={(e) => { e.target.style.transform = "translateY(0px)"; e.target.style.boxShadow = "0 8px 20px rgba(0,234,255,.4)"; }}>
          Add Expense
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "20px", borderRadius: "12px", width: "200px", textAlign: "center" }}>
          <h3>Total Income</h3>
          <h2 style={{ color: "#00ff99" }}>{formatPKR(totalIncome)}</h2>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "20px", borderRadius: "12px", width: "200px", textAlign: "center" }}>
          <h3>Expenses</h3>
          <h2 style={{ color: "#ff4444" }}>{formatPKR(totalExpense)}</h2>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "20px", borderRadius: "12px", width: "200px", textAlign: "center" }}>
          <h3>Pending</h3>
          <h2 style={{ color: "#ffb300" }}>{formatPKR(totalPending)}</h2>
        </div>
        <div style={{
          background: netProfit >= 0 ? "rgba(0,255,153,0.1)" : "rgba(255,0,77,0.1)",
          backdropFilter: "blur(18px)",
          border: `1px solid ${netProfit >= 0 ? "rgba(0,255,153,.5)" : "rgba(255,0,77,.5)"}`,
          padding: "20px",
          borderRadius: "12px",
          width: "200px",
          textAlign: "center"
        }}>
          <h3>Profit</h3>
          <h2 style={{ color: netProfit >= 0 ? "#00ff99" : "#ff4444" }}>{formatPKR(netProfit)}</h2>
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "30px", fontFamily: "Orbitron, sans-serif" }}>📋 Expense History</h2>
      {expenses.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>Koi expense nahi abhi 😕</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
          {expenses.map((e) => (
            <div key={e.id}
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "15px 25px", borderRadius: "12px", textAlign: "center", minWidth: "180px" }}>
              <h3 style={{ color: "#00eaff" }}>{e.title}</h3>
              <p style={{ fontSize: "20px", fontWeight: "bold" }}>{formatPKR(e.amount)}</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>📅 {e.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Month End Report with PKR */}
      <hr style={{ margin: "40px 0", borderColor: "rgba(0,234,255,.2)" }} />
      <h1 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif", color: "#00eaff", textShadow: "0 0 10px #00eaff" }}>📊 Month End Report</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={() => setShowReport(!showReport)} style={{
          padding: "12px 35px",
          background: "linear-gradient(135deg,#00eaff,#0066ff)",
          boxShadow: "0 8px 20px rgba(0,234,255,.4)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          transition: "0.2s"
        }}
        onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 25px rgba(0,234,255,.5)"; }}
        onMouseLeave={(e) => { e.target.style.transform = "translateY(0px)"; e.target.style.boxShadow = "0 8px 20px rgba(0,234,255,.4)"; }}>
          {showReport ? "❌ Close Report" : "📄 Generate Report"}
        </button>
      </div>

      {showReport && (
        <div style={{
          background: "rgba(15,23,42,0.95)",
          backdropFilter: "blur(18px)",
          border: "2px solid rgba(0,234,255,.5)",
          boxShadow: "0 25px 45px rgba(0,0,0,.5), 0 0 30px rgba(0,234,255,.3)",
          borderRadius: "16px",
          padding: "35px",
          maxWidth: "550px",
          margin: "0 auto",
          fontFamily: "monospace",
          fontSize: "15px",
          lineHeight: "2",
        }}>
          <p style={{ textAlign: "center", color: "#00eaff" }}>════════════════════════════════</p>
          <h2 style={{ textAlign: "center", color: "#00eaff", margin: "4px 0", textShadow: "0 0 5px #00eaff" }}>🏋️ IBRAAJ FITNESS</h2>
          <p style={{ textAlign: "center", color: "#60a5fa" }}>Month : {monthYear}</p>
          <p style={{ textAlign: "center", color: "#94a3b8" }}>────────────────────────────</p>

          <p>👥 Total Members : <strong>{members.length}</strong></p>
          <p>💪 Self Training : <strong>{members.filter((m) => m.plan === "Self Training").length}</strong></p>
          <p>🏆 Training : <strong>{members.filter((m) => m.plan === "Training").length}</strong></p>
          <p>🏃 Cardio : <strong>{members.filter((m) => m.plan === "Cardio").length}</strong></p>
          <p>💪🏃 Self + Cardio : <strong>{members.filter((m) => m.plan === "Self + Cardio").length}</strong></p>
          <p>🏆🏃 Training + Cardio : <strong>{members.filter((m) => m.plan === "Training + Cardio").length}</strong></p>

          <p style={{ color: "#94a3b8" }}>────────────────────────────</p>

          <p>💰 Total Income : <strong style={{ color: "#00ff99" }}>{formatPKR(totalIncome)}</strong></p>
          <p>💸 Total Expenses : <strong style={{ color: "#f87171" }}>{formatPKR(totalExpense)}</strong></p>
          <p>❌ Pending Fees : <strong style={{ color: "#fbbf24" }}>{formatPKR(totalPending)}</strong></p>
          <p>📈 Net Profit : <strong style={{ color: netProfit >= 0 ? "#00ff99" : "#f87171" }}>{formatPKR(netProfit)}</strong></p>

          <p style={{ color: "#94a3b8" }}>────────────────────────────</p>

          <p style={{ color: "#94a3b8", marginBottom: "6px" }}>📋 Expenses Breakdown :</p>
          {expenses.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Koi expense nahi</p>
          ) : (
            expenses.map((e) => (
              <p key={e.id}>• {e.title} : <strong>{formatPKR(e.amount)}</strong></p>
            ))
          )}

          <p style={{ color: "#00eaff" }}>════════════════════════════════</p>
          <p style={{ textAlign: "center", color: "#475569", fontSize: "11px" }}>
            Generated : {todayStr} {timeStr}
          </p>
        </div>
      )}

    </div>
  );
}

export default App;