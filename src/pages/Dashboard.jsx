import { safeFormatPKR, getRemainingDaysText, getRemainingDaysType, getRemainingDaysNumber } from "../utils/helpers";

function Dashboard({ members, dueTodayCount, totalIncome, totalExpense, netProfit, cashPayments, onlinePayments, cardPayments, jazzCashPayments, formatPKR }) {
  
  const safeMembers = members || [];
  
  // Get due members based on remaining days
  const getDueMembers = () => {
    if (!safeMembers.length) return [];
    return safeMembers
      .filter(m => m.feeStatus === "Unpaid" && m.dueDate)
      .map(m => {
        const days = getRemainingDaysNumber(m.dueDate);
        const type = getRemainingDaysType(m.dueDate);
        const text = getRemainingDaysText(m.dueDate);
        return { ...m, reminderText: text, reminderType: type, diffDays: days || 0 };
      })
      .filter(m => m.reminderText !== "Not Set")
      .sort((a, b) => a.diffDays - b.diffDays);
  };

  const dueMembers = getDueMembers();
  const overdueCount = dueMembers.filter(m => m.reminderType === "overdue").length;
  const todayCount = dueMembers.filter(m => m.reminderType === "today").length;
  const upcomingCount = dueMembers.filter(m => m.reminderType === "upcoming").length;

  const getReminderIcon = (type) => {
    switch(type) {
      case "overdue": return "🚨";
      case "today": return "⚠️";
      default: return "⏰";
    }
  };

  const getReminderColor = (type) => {
    switch(type) {
      case "overdue": return "#ff4444";
      case "today": return "#ffcc00";
      default: return "#00ff88";
    }
  };

  return (
    <div>
      {/* Dashboard Cards */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div style={{ background: "rgba(255,215,0,0.05)", backdropFilter: "blur(18px)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>Total Members</h3>
          <h1 style={{ fontSize: "42px", color: "#FFD700" }}>{safeMembers.length}</h1>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", backdropFilter: "blur(18px)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>Active</h3>
          <h1 style={{ fontSize: "42px", color: "#FFD700" }}>{safeMembers.filter((m) => m.status === "active").length}</h1>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", backdropFilter: "blur(18px)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>Paid</h3>
          <h1 style={{ fontSize: "42px", color: "#FFD700" }}>{safeMembers.filter((m) => m.feeStatus === "Paid").length}</h1>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", backdropFilter: "blur(18px)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>Unpaid</h3>
          <h1 style={{ fontSize: "42px", color: "#FFD700" }}>{safeMembers.filter((m) => m.feeStatus === "Unpaid").length}</h1>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", backdropFilter: "blur(18px)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>Self Training</h3>
          <h1 style={{ fontSize: "42px", color: "#FFD700" }}>{safeMembers.filter((m) => m.plan === "Self Training").length}</h1>
        </div>
        <div style={{ background: "rgba(255,215,0,0.05)", backdropFilter: "blur(18px)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ color: "#FFD700" }}>Training</h3>
          <h1 style={{ fontSize: "42px", color: "#FFD700" }}>{safeMembers.filter((m) => m.plan === "Training").length}</h1>
        </div>
        <div style={{
          background: (dueTodayCount || 0) > 0 ? "rgba(255,68,68,0.15)" : "rgba(255,215,0,0.05)",
          border: (dueTodayCount || 0) > 0 ? "1px solid #ff4444" : "1px solid #FFD700",
          boxShadow: (dueTodayCount || 0) > 0 ? "0 0 8px rgba(255,68,68,0.25)" : "0 0 8px rgba(255,215,0,0.25)",
          padding: "20px", width: "200px", borderRadius: "10px", textAlign: "center"
        }}>
          <h3 style={{ color: (dueTodayCount || 0) > 0 ? "#ff4444" : "#FFD700" }}>⚠️ Fees Due</h3>
          <h1 style={{ fontSize: "42px", color: (dueTodayCount || 0) > 0 ? "#ff4444" : "#FFD700" }}>{dueTodayCount || 0}</h1>
        </div>
      </div>

      {/* Fee Due Reminder */}
      <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "25px", marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ color: "#FFD700", margin: "0", fontFamily: "Orbitron, sans-serif", fontSize: "22px" }}>⚠️ Fee Due Reminder</h2>
          {dueMembers.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {overdueCount > 0 && <span style={{ background: "rgba(255,68,68,0.2)", color: "#ff4444", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>🚨 {overdueCount} Overdue</span>}
              {todayCount > 0 && <span style={{ background: "rgba(255,204,0,0.2)", color: "#ffcc00", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>⚠️ {todayCount} Today</span>}
              {upcomingCount > 0 && <span style={{ background: "rgba(0,255,136,0.2)", color: "#00ff88", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>⏰ {upcomingCount} Upcoming</span>}
            </div>
          )}
        </div>
        {dueMembers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px" }}>
            <p style={{ color: "#00ff99", fontSize: "16px", marginBottom: "10px" }}>✅ No pending dues!</p>
            <p style={{ color: "#9ca3af", fontSize: "12px" }}>All members are up to date. Great work! 🎉</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {dueMembers.map(member => (
              <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: member.reminderType === "overdue" ? "rgba(255,68,68,0.1)" : member.reminderType === "today" ? "rgba(255,204,0,0.08)" : "rgba(0,0,0,0.3)", borderRadius: "12px", borderLeft: `4px solid ${getReminderColor(member.reminderType)}`, flexWrap: "wrap", gap: "10px", transition: "0.3s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(5px)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0px)"; }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "20px" }}>{getReminderIcon(member.reminderType)}</span>
                    <strong style={{ color: "#FFD700", fontSize: "16px" }}>{member.name}</strong>
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>🆔 {member.memberId}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "5px" }}>
                    💰 Monthly: {safeFormatPKR(member.monthlyFee, formatPKR)} | Paid: {safeFormatPKR(member.paidFee, formatPKR)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "#9ca3af" }}>📅 Due: {member.dueDate}</div>
                  <span style={{ color: getReminderColor(member.reminderType), fontWeight: "bold", fontSize: "13px" }}>
                    {member.reminderType === "overdue" ? `🚨 ${member.reminderText}` :
                     member.reminderType === "today" ? `⚠️ ${member.reminderText}` :
                     `⏰ ${member.reminderText}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ textAlign: "center", fontFamily: "Orbitron, sans-serif", color: "#FFD700" }}>💳 Payment Method Summary</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "15px" }}>
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#FFD700" }}>💵 Cash</h3>
            <h2 style={{ color: "#FFD700" }}>{safeFormatPKR(cashPayments, formatPKR)}</h2>
          </div>
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#FFD700" }}>🌐 Online</h3>
            <h2 style={{ color: "#FFD700" }}>{safeFormatPKR(onlinePayments, formatPKR)}</h2>
          </div>
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#FFD700" }}>💳 Card</h3>
            <h2 style={{ color: "#FFD700" }}>{safeFormatPKR(cardPayments, formatPKR)}</h2>
          </div>
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid #FFD700", boxShadow: "0 0 8px rgba(255,215,0,0.25)", padding: "15px", borderRadius: "12px", minWidth: "160px", textAlign: "center" }}>
            <h3 style={{ color: "#FFD700" }}>📱 JazzCash</h3>
            <h2 style={{ color: "#FFD700" }}>{safeFormatPKR(jazzCashPayments, formatPKR)}</h2>
          </div>
        </div>
      </div>

      {/* Accounts Summary */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
        <div style={{ background: "rgba(0,255,153,0.1)", padding: "20px", borderRadius: "12px", width: "180px", textAlign: "center", border: "1px solid #00ff99" }}>
          <h3 style={{ color: "#00ff99" }}>Total Income</h3>
          <h2 style={{ color: "#00ff99" }}>{safeFormatPKR(totalIncome, formatPKR)}</h2>
        </div>
        <div style={{ background: "rgba(255,68,68,0.1)", padding: "20px", borderRadius: "12px", width: "180px", textAlign: "center", border: "1px solid #ff4444" }}>
          <h3 style={{ color: "#ff4444" }}>Expenses</h3>
          <h2 style={{ color: "#ff4444" }}>{safeFormatPKR(totalExpense, formatPKR)}</h2>
        </div>
        <div style={{ background: (netProfit || 0) >= 0 ? "rgba(0,255,153,0.1)" : "rgba(255,68,68,0.1)", padding: "20px", borderRadius: "12px", width: "180px", textAlign: "center", border: (netProfit || 0) >= 0 ? "1px solid #00ff88" : "1px solid #ff4444" }}>
          <h3 style={{ color: (netProfit || 0) >= 0 ? "#00ff88" : "#ff4444" }}>Profit</h3>
          <h2 style={{ color: (netProfit || 0) >= 0 ? "#00ff88" : "#ff4444" }}>{safeFormatPKR(netProfit, formatPKR)}</h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;