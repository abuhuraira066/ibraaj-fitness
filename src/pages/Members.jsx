import { useNavigate } from "react-router-dom";

export default function Members({
  members,
  filteredMembers,
  searchQuery,
  setSearchQuery,
  name,
  setName,
  phone,
  setPhone,
  plan,
  setPlan,
  feeStatus,
  setFeeStatus,
  paymentMethod,
  setPaymentMethod,
  monthlyFee,
  setMonthlyFee,
  paidFee,
  setPaidFee,
  dueDate,
  setDueDate,
  editingId,
  setEditingId,
  addMember,
  deleteMember,
  markAttendance,
  formatPKR,
  getPaymentColor,
}) {
  const navigate = useNavigate();

  const safeFormatPKR = (amount) => {
    if (formatPKR && typeof formatPKR === 'function') return formatPKR(amount);
    return new Intl.NumberFormat("ur-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
  };

  const handleEdit = (member) => {
    setName(member.name); setPhone(member.phone); setPlan(member.plan); setFeeStatus(member.feeStatus);
    setPaymentMethod(member.paymentMethod || "Cash"); setMonthlyFee(member.monthlyFee || ""); setPaidFee(member.paidFee || "");
    setDueDate(member.dueDate || ""); setEditingId(member.id); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getRemainingDays = (dueDate) => {
    if (!dueDate) return "Not Set";
    const today = new Date(), due = new Date(dueDate);
    today.setHours(0,0,0,0); due.setHours(0,0,0,0);
    const diff = Math.ceil((due - today) / (1000*60*60*24));
    if (diff > 0) return `${diff} Days Left`;
    if (diff === 0) return "Due Today";
    return `${Math.abs(diff)} Days Overdue`;
  };

  const getRemainingDaysColor = (dueDate) => {
    if (!dueDate) return "#9ca3af";
    const today = new Date(), due = new Date(dueDate);
    today.setHours(0,0,0,0); due.setHours(0,0,0,0);
    const diff = Math.ceil((due - today) / (1000*60*60*24));
    if (diff > 0) return "#00ff88";
    if (diff === 0) return "#ffcc00";
    return "#ff4444";
  };

  const safeMembers = Array.isArray(filteredMembers) ? filteredMembers : [];

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "#FFD700", marginBottom: "25px", fontFamily: "Orbitron, sans-serif" }}>👥 Members Management</h1>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "30px", background: "rgba(255,215,0,0.05)", padding: "25px", borderRadius: "20px" }}>
        <input placeholder="Member Name" value={name} onChange={(e) => setName(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px", minWidth: "160px" }} />
        <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px", minWidth: "160px" }} />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px" }}>
          <option>Self Training</option><option>Training</option><option>Cardio</option><option>Self + Cardio</option><option>Training + Cardio</option>
        </select>
        <select value={feeStatus} onChange={(e) => setFeeStatus(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px" }}>
          <option>Paid</option><option>Unpaid</option>
        </select>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px" }}>
          <option>Cash</option><option>Online</option><option>Card</option><option>JazzCash / Easypaisa</option>
        </select>
        <input placeholder="Monthly Fee" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px", width: "140px" }} />
        <input placeholder="Paid Fee" value={paidFee} onChange={(e) => setPaidFee(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px", width: "140px" }} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ background: "#0a0a0a", border: "1px solid #FFD700", color: "white", padding: "12px", borderRadius: "10px" }} />
        <button onClick={addMember} style={{ background: editingId ? "#FFB300" : "#FFD700", color: "#0a0a0a", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>{editingId ? "Update Member" : "Add Member"}</button>
        {editingId && <button onClick={() => { setEditingId(null); setName(""); setPhone(""); setPlan("Self Training"); setFeeStatus("Unpaid"); setPaymentMethod("Cash"); setMonthlyFee(""); setPaidFee(""); setDueDate(""); }} style={{ background: "#6b7280", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>}
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input placeholder="🔍 Search by Name / Phone / ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "350px", padding: "12px 20px", background: "#0a0a0a", border: "1px solid #FFD700", color: "white", borderRadius: "12px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
        {safeMembers.length === 0 ? <p style={{ textAlign: "center", color: "#9ca3af" }}>Koi member nahi mila 😕</p> : safeMembers.map((member) => {
          const isDue = member.feeStatus === "Unpaid" && member.dueDate && new Date(member.dueDate) <= new Date();
          return (
            <div key={member.id} onClick={() => navigate(`/member/${member.id}`)} style={{ cursor: "pointer", background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: isDue ? "2px solid #ff4444" : "1px solid #FFD700", borderRadius: "15px", padding: "20px" }}>
              <div style={{ display: "inline-block", background: "rgba(255,215,0,0.15)", color: "#FFD700", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>🆔 {member.memberId || "—"}</div>
              <h2 style={{ color: "#FFD700" }}>{member.name}</h2>
              <p>📞 {member.phone}</p>
              <p>📅 Joined: {member.joinDate || "—"}</p>
              <p>💪 {member.plan}</p>
              <hr />
              <p>💳 Status: <strong style={{ color: member.feeStatus === "Paid" ? "#00ff99" : "#ff4444" }}>{member.feeStatus}</strong></p>
              <p>💳 Method: <strong style={{ color: getPaymentColor(member.paymentMethod) }}>{member.paymentMethod || "Cash"}</strong></p>
              <p>💵 Monthly: {safeFormatPKR(member.monthlyFee)}</p>
              <p>✅ Paid: {safeFormatPKR(member.paidFee)}</p>
              <p>📅 Due: {member.dueDate || "Not Set"}</p>
              <p style={{ color: getRemainingDaysColor(member.dueDate), fontWeight: "bold" }}>⏳ {getRemainingDays(member.dueDate)}</p>
              {isDue && <p style={{ color: "#ff4444", fontWeight: "bold" }}>⚠️ Fee Due!</p>}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleEdit(member)} style={{ background: "#FFB300", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>✏️ Edit</button>
                <button onClick={() => markAttendance(member)} style={{ background: "#00ff99", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>✅ Present</button>
                <button onClick={() => deleteMember(member.id)} style={{ background: "#ff4444", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>🗑️ Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}