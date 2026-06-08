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
  const [paymentMethod, setPaymentMethod] = useState("Cash");
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMembers = async () => {
    const data = await getDocs(membersRef);
    setMembers(data.docs.map((item) => ({ ...item.data(), id: item.id })));
  };

  const fetchExpenses = async () => {
    const data = await getDocs(expensesRef);
    setExpenses(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchMembers();
    fetchExpenses();
  }, []);

  const dueTodayCount = members.filter(
    (m) => m.feeStatus === "Unpaid" && m.dueDate && new Date(m.dueDate) <= new Date()
  ).length;

  const totalIncome = members.reduce((sum, m) => sum + Number(m.paidFee || 0), 0);
  const totalPending = members.reduce(
    (sum, m) => sum + (Number(m.totalFee || 0) - Number(m.paidFee || 0) - Number(m.discount || 0)),
    0
  );
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;

  // Payment Method Stats
  const cashPayments = members.reduce((sum, m) => sum + (m.paymentMethod === "Cash" ? Number(m.paidFee || 0) : 0), 0);
  const onlinePayments = members.reduce((sum, m) => sum + (m.paymentMethod === "Online" ? Number(m.paidFee || 0) : 0), 0);
  const cardPayments = members.reduce((sum, m) => sum + (m.paymentMethod === "Card" ? Number(m.paidFee || 0) : 0), 0);
  const jazzCashPayments = members.reduce((sum, m) => sum + (m.paymentMethod === "JazzCash / Easypaisa" ? Number(m.paidFee || 0) : 0), 0);

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone?.includes(searchQuery) ||
      (m.memberId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMember = async () => {
    if (!name || !phone) {
      alert("Name aur Phone likho");
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "members", editingId), {
        name, phone, plan, feeStatus, paymentMethod,
        monthlyFee, totalFee, paidFee, discount, dueDate,
        remainingFee: Number(totalFee || 0) - Number(paidFee || 0) - Number(discount || 0),
      });
      alert("Member Updated");
      setEditingId(null);
    } else {
      const memberId = `IBF-${String(members.length + 1).padStart(4, "0")}`;
      await addDoc(membersRef, {
        memberId, name, phone, plan, feeStatus, paymentMethod,
        monthlyFee, totalFee, paidFee, discount, dueDate,
        remainingFee: Number(totalFee || 0) - Number(paidFee || 0) - Number(discount || 0),
        joinDate: new Date().toLocaleDateString(),
        status: "active",
      });
      alert("Member Added — ID: " + memberId);
    }

    setName(""); setPhone(""); setPlan("Self Training"); setFeeStatus("Unpaid");
    setPaymentMethod("Cash");
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
    setExpenseName("");
    setExpenseAmount("");
    fetchExpenses();
    alert("Expense Added");
  };

  const todayStr = currentTime.toLocaleDateString("en-GB");
  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });
  const monthYear = currentTime.toLocaleString("en-US", { month: "long", year: "numeric" });

  const formatPKR = (amount) => {
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentColor = (method) => {
    switch (method) {
      case "Cash": return "#00ff99";
      case "Online": return "#00eaff";
      case "Card": return "#ffb300";
      case "JazzCash / Easypaisa": return "#ff6600";
      default: return "white";
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#020617,#0f172a,#111827)",
        minHeight: "100vh",
        padding: "35px",
        maxWidth: "1700px",
        margin: "auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h1
          style={{
            margin: "0",
            fontSize: "52px",
            fontFamily: "Orbitron, sans-serif",
            color: "#00eaff",
            letterSpacing: "4px",
            textShadow: "0 0 10px #00eaff, 0 0 25px #00eaff, 0 0 50px #00eaff",
          }}
        >
          🏋️ IBRAAJ FITNESS
        </h1>
        <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: "15px" }}>
          📅 Today : {todayStr} &nbsp;|&nbsp; 🕒 Time : {timeStr}
        </p>
      </div>

      <hr style={{ borderColor: "#374151", margin: "15px 0 25px" }} />

      {/* Dashboard Cards */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3>Total Members</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff" }}>{members.length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3>Active</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff" }}>{members.filter((m) => m.status === "active").length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3>Paid</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff" }}>{members.filter((m) => m.feeStatus === "Paid").length}</h1>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px)", border: "1px solid rgba(0,234,255,.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3>Unpaid</h3>
          <h1 style={{ fontSize: "42px", color: "#00eaff" }}>{members.filter((m) => m.feeStatus === "Unpaid").length}</h1>
        </div>
        <div style={{ background: dueTodayCount > 0 ? "rgba(255,0,0,0.15)" : "rgba(255,255,255,0.05)", border: dueTodayCount > 0 ? "1px solid red" : "1px solid rgba(0,234,255,.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3>⚠️ Fees Due</h3>
          <h1 style={{ fontSize: "42px", color: dueTodayCount > 0 ? "#ff4444" : "#00eaff" }}>{dueTodayCount}</h1>
        </div>
      </div>

      {/* Payment Method Summary */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif", color: "#00eaff" }}>💳 Payment Method Summary</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "15px" }}>
          <div style={{ background: "rgba(0,255,153,0.1)", border: "1px solid #00ff99", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#00ff99" }}>💵 Cash</h3>
            <h2>{formatPKR(cashPayments)}</h2>
          </div>
          <div style={{ background: "rgba(0,234,255,0.1)", border: "1px solid #00eaff", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#00eaff" }}>🌐 Online</h3>
            <h2>{formatPKR(onlinePayments)}</h2>
          </div>
          <div style={{ background: "rgba(255,179,0,0.1)", border: "1px solid #ffb300", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#ffb300" }}>💳 Card</h3>
            <h2>{formatPKR(cardPayments)}</h2>
          </div>
          <div style={{ background: "rgba(255,102,0,0.1)", border: "1px solid #ff6600", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#ff6600" }}>📱 JazzCash</h3>
            <h2>{formatPKR(jazzCashPayments)}</h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ textAlign: "center" }}>
        <input type="text" placeholder="Member Name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "170px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "170px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />

        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ padding: "10px", marginRight: "10px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }}>
          <option>Self Training</option>
          <option>Training</option>
          <option>Cardio</option>
          <option>Self + Cardio</option>
          <option>Training + Cardio</option>
        </select>

        <select value={feeStatus} onChange={(e) => setFeeStatus(e.target.value)} style={{ padding: "10px", marginRight: "10px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }}>
          <option>Paid</option>
          <option>Unpaid</option>
        </select>

        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ padding: "10px", marginRight: "10px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }}>
          <option>Cash</option>
          <option>Online</option>
          <option>Card</option>
          <option>JazzCash / Easypaisa</option>
        </select>

        <input type="number" placeholder="Monthly Fee (PKR)" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Total Fee (PKR)" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Paid Fee (PKR)" value={paidFee} onChange={(e) => setPaidFee(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Discount (PKR)" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "150px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "160px", marginBottom: "10px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <br />
        <button onClick={addMember} style={{ padding: "10px 20px", background: editingId ? "#ffb300" : "#00eaff", color: editingId ? "white" : "black", border: "none", cursor: "pointer", borderRadius: "8px", marginTop: "10px", fontWeight: "bold" }}>
          {editingId ? "Update Member" : "Add Member"}
        </button>
        {editingId && (
          <button onClick={() => { setEditingId(null); setName(""); setPhone(""); setPlan("Self Training"); setFeeStatus("Unpaid"); setPaymentMethod("Cash"); setMonthlyFee(""); setTotalFee(""); setPaidFee(""); setDiscount(""); setDueDate(""); }} style={{ padding: "10px 20px", background: "#6b7280", color: "white", border: "none", cursor: "pointer", borderRadius: "8px", marginLeft: "10px", marginTop: "10px" }}>
            Cancel
          </button>
        )}
      </div>

      <hr style={{ margin: "30px 0" }} />

      {/* Search */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input type="text" placeholder="🔍 Search by Name / Phone / ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: "12px 20px", width: "350px", borderRadius: "12px", border: "1px solid #00eaff", background: "#1a1a1a", color: "white", fontSize: "16px" }} />
      </div>

      <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif" }}>👥 Members List ({filteredMembers.length} found)</h2>

      {filteredMembers.map((member) => {
        const remaining = Number(member.totalFee || 0) - Number(member.paidFee || 0) - Number(member.discount || 0);
        const isDue = member.feeStatus === "Unpaid" && member.dueDate && new Date(member.dueDate) <= new Date();

        return (
          <div key={member.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "25px", marginBottom: "20px", textAlign: "center", border: isDue ? "1px solid red" : "1px solid #00eaff" }}>
            <div style={{ display: "inline-block", background: "rgba(0,234,255,0.15)", color: "#00eaff", padding: "4px 20px", borderRadius: "30px", fontSize: "13px", marginBottom: "10px" }}>
              🆔 {member.memberId || "—"}
            </div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif" }}>👤 {member.name}</h2>
            <p>📞 {member.phone}</p>
            <p>📅 Join Date : {member.joinDate || "—"}</p>
            <p>💪 {member.plan}</p>
            <p>🟢 {member.status}</p>
            <hr />
            <p>💳 Fee Status : <strong style={{ color: member.feeStatus === "Paid" ? "#00ff99" : "#ff4444" }}>{member.feeStatus}</strong></p>
            <p>💳 Payment Method : <strong style={{ color: getPaymentColor(member.paymentMethod) }}>{member.paymentMethod || "Cash"}</strong></p>
            <p>💰 Total Fee : {formatPKR(member.totalFee || 0)}</p>
            <p>✅ Paid Fee : {formatPKR(member.paidFee || 0)}</p>
            <p>❌ Remaining : {formatPKR(remaining)}</p>
            {isDue ? <h3 style={{ color: "#ff4444" }}>⚠️ Fee Due</h3> : <h3 style={{ color: "#00ff99" }}>✅ Fees Cleared</h3>}

            <div style={{ marginTop: "20px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setEditingId(member.id); setName(member.name); setPhone(member.phone); setPlan(member.plan); setFeeStatus(member.feeStatus); setPaymentMethod(member.paymentMethod || "Cash"); setMonthlyFee(member.monthlyFee || ""); setTotalFee(member.totalFee || ""); setPaidFee(member.paidFee || ""); setDiscount(member.discount || ""); setDueDate(member.dueDate || ""); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ background: "#ffb300", color: "white", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer" }}>✏️ Edit</button>
              <button onClick={() => markAttendance(member)} style={{ background: "#00ff99", color: "black", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer" }}>✅ Present</button>
              <button onClick={() => deleteMember(member.id)} style={{ background: "#ff004d", color: "white", border: "none", padding: "10px 25px", borderRadius: "8px", cursor: "pointer" }}>🗑️ Delete</button>
            </div>
          </div>
        );
      })}

      {/* Accounts Section */}
      <hr style={{ margin: "40px 0" }} />
      <h1 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif", color: "#00eaff" }}>💰 Accounts (PKR)</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input placeholder="Expense Name" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "200px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <input type="number" placeholder="Amount (PKR)" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} style={{ padding: "10px", marginRight: "10px", width: "150px", background: "#1a1a1a", border: "1px solid #00eaff", borderRadius: "8px", color: "white" }} />
        <button onClick={addExpense} style={{ padding: "10px 25px", background: "#00eaff", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Add Expense</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ background: "rgba(0,255,153,0.1)", padding: "20px", borderRadius: "12px", width: "180px", textAlign: "center" }}>
          <h3>Total Income</h3>
          <h2 style={{ color: "#00ff99" }}>{formatPKR(totalIncome)}</h2>
        </div>
        <div style={{ background: "rgba(255,68,68,0.1)", padding: "20px", borderRadius: "12px", width: "180px", textAlign: "center" }}>
          <h3>Expenses</h3>
          <h2 style={{ color: "#ff4444" }}>{formatPKR(totalExpense)}</h2>
        </div>
        <div style={{ background: "rgba(255,179,0,0.1)", padding: "20px", borderRadius: "12px", width: "180px", textAlign: "center" }}>
          <h3>Pending</h3>
          <h2 style={{ color: "#ffb300" }}>{formatPKR(totalPending)}</h2>
        </div>
        <div style={{ background: netProfit >= 0 ? "rgba(0,255,153,0.1)" : "rgba(255,68,68,0.1)", padding: "20px", borderRadius: "12px", width: "180px", textAlign: "center" }}>
          <h3>Profit</h3>
          <h2 style={{ color: netProfit >= 0 ? "#00ff99" : "#ff4444" }}>{formatPKR(netProfit)}</h2>
        </div>
      </div>

      {/* Month End Report Button */}
      <hr style={{ margin: "40px 0" }} />
      <div style={{ textAlign: "center" }}>
        <button onClick={() => setShowReport(!showReport)} style={{ padding: "12px 35px", background: "#00eaff", color: "black", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>
          {showReport ? "❌ Close Report" : "📄 Generate Report"}
        </button>
      </div>

      {showReport && (
        <div style={{ background: "#0f172a", border: "2px solid #00eaff", borderRadius: "16px", padding: "30px", maxWidth: "500px", margin: "20px auto", textAlign: "center" }}>
          <h2 style={{ color: "#00eaff" }}>🏋️ IBRAAJ FITNESS</h2>
          <p>Month : {monthYear}</p>
          <hr />
          <p>👥 Total Members : {members.length}</p>
          <p>💰 Total Income : {formatPKR(totalIncome)}</p>
          <p>💸 Expenses : {formatPKR(totalExpense)}</p>
          <p>📈 Net Profit : {formatPKR(netProfit)}</p>
          <hr />
          <p>💳 Payment Breakdown:</p>
          <p>Cash: {formatPKR(cashPayments)}</p>
          <p>Online: {formatPKR(onlinePayments)}</p>
          <p>Card: {formatPKR(cardPayments)}</p>
          <p>JazzCash: {formatPKR(jazzCashPayments)}</p>
        </div>
      )}
    </div>
  );
}

export default App;