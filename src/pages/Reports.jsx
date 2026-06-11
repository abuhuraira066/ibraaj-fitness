import { useState } from "react";
import html2pdf from "html2pdf.js";

export default function Reports({
  members,
  totalIncome,
  totalExpense,
  netProfit,
  cashPayments,
  onlinePayments,
  cardPayments,
  jazzCashPayments,
  monthYear,
  formatPKR,
}) {
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Safe formatPKR function
  const safeFormatPKR = (amount) => {
    if (amount === undefined || amount === null) return "Rs 0";
    if (formatPKR && typeof formatPKR === 'function') {
      return formatPKR(amount);
    }
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // Safe members array
  const safeMembers = Array.isArray(members) ? members : [];

  // Plan configurations
  const plans = [
    { key: "Self Training", icon: "💪", name: "Self Training", color: "#FFD700" },
    { key: "Training", icon: "🏆", name: "Training", color: "#FFC107" },
    { key: "Cardio", icon: "🏃", name: "Cardio", color: "#FFB300" },
    { key: "Self + Cardio", icon: "💪🏃", name: "Self + Cardio", color: "#00ff88" },
    { key: "Training + Cardio", icon: "🏆🏃", name: "Training + Cardio", color: "#0099ff" },
  ];

  const handlePlanClick = (planName) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  const getPlanMembers = (planName) => {
    return safeMembers.filter(m => m?.plan === planName);
  };

  const downloadPDF = () => {
    const element = document.getElementById("report-content");
    if (!element) return;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `IBRAAJ_FITNESS_Report_${(monthYear || "Monthly").replace(/ /g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Get plan color
  const getPlanColor = (planKey) => {
    const plan = plans.find(p => p.key === planKey);
    return plan ? plan.color : "#FFD700";
  };

  // Get plan icon
  const getPlanIcon = (planKey) => {
    const plan = plans.find(p => p.key === planKey);
    return plan ? plan.icon : "🏋️";
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 10px" }}>
      <h1
        style={{
          textAlign: "center",
          color: "#FFD700",
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 10px #FFD700",
          marginBottom: "30px",
          fontSize: "clamp(28px, 5vw, 42px)",
        }}
      >
        📊 Reports & Analytics
      </h1>

      {/* PDF Export Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <button
          onClick={downloadPDF}
          style={{
            background: "linear-gradient(135deg, #FFD700, #B8860B)",
            color: "#0a0a0a",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📄 Download PDF Report
        </button>
      </div>

      {/* Report Content */}
      <div id="report-content">
        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div style={{ background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: "2px solid #FFD700", padding: "20px", borderRadius: "15px", textAlign: "center" }}>
            <h3 style={{ color: "#cbd5e1", marginBottom: "10px", fontSize: "16px" }}>👥 Total Members</h3>
            <h1 style={{ color: "#FFD700", fontSize: "36px", margin: "0" }}>{safeMembers.length}</h1>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: "2px solid #00ff99", padding: "20px", borderRadius: "15px", textAlign: "center" }}>
            <h3 style={{ color: "#cbd5e1", marginBottom: "10px", fontSize: "16px" }}>💰 Total Income</h3>
            <h1 style={{ color: "#00ff99", fontSize: "28px", margin: "0", wordBreak: "break-word" }}>{safeFormatPKR(totalIncome)}</h1>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: "2px solid #ff4444", padding: "20px", borderRadius: "15px", textAlign: "center" }}>
            <h3 style={{ color: "#cbd5e1", marginBottom: "10px", fontSize: "16px" }}>💸 Total Expenses</h3>
            <h1 style={{ color: "#ff4444", fontSize: "28px", margin: "0", wordBreak: "break-word" }}>{safeFormatPKR(totalExpense)}</h1>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: (netProfit || 0) >= 0 ? "2px solid #FFD700" : "2px solid #ff4444", padding: "20px", borderRadius: "15px", textAlign: "center" }}>
            <h3 style={{ color: "#cbd5e1", marginBottom: "10px", fontSize: "16px" }}>📈 Net Profit</h3>
            <h1 style={{ color: (netProfit || 0) >= 0 ? "#FFD700" : "#ff4444", fontSize: "28px", margin: "0", wordBreak: "break-word" }}>{safeFormatPKR(netProfit)}</h1>
          </div>
        </div>

        {/* Plan Wise Report - Clickable Cards */}
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "25px", marginBottom: "25px" }}>
          <h2 style={{ color: "#FFD700", textAlign: "center", marginBottom: "20px", fontFamily: "Orbitron, sans-serif", fontSize: "clamp(18px, 4vw, 24px)" }}>
            🏋️ Plan Wise Members Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {plans.map((plan) => {
              const planMembers = getPlanMembers(plan.key);
              return (
                <div 
                  key={plan.key}
                  onClick={() => handlePlanClick(plan.key)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "15px 20px", 
                    background: "rgba(255,215,0,0.05)", 
                    borderRadius: "10px", 
                    flexWrap: "wrap",
                    cursor: "pointer",
                    transition: "0.3s",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,215,0,0.15)";
                    e.currentTarget.style.borderColor = plan.color;
                    e.currentTarget.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,215,0,0.05)";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.transform = "translateX(0px)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{plan.icon}</span>
                    <span style={{ fontSize: "16px", color: "#cbd5e1", fontWeight: "bold" }}>{plan.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ fontSize: "22px", fontWeight: "bold", color: plan.color }}>{planMembers.length}</span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>members</span>
                    <span style={{ fontSize: "14px", color: "#FFD700" }}>👉</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Breakdown Report */}
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "25px", marginBottom: "25px" }}>
          <h2 style={{ color: "#FFD700", textAlign: "center", marginBottom: "20px", fontFamily: "Orbitron, sans-serif", fontSize: "clamp(18px, 4vw, 24px)" }}>
            💳 Payment Method Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.1)", borderRadius: "10px", borderLeft: "3px solid #FFD700", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>💵 Cash</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#FFD700", wordBreak: "break-word" }}>{safeFormatPKR(cashPayments)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.08)", borderRadius: "10px", borderLeft: "3px solid #FFC107", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>🌐 Online</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#FFC107", wordBreak: "break-word" }}>{safeFormatPKR(onlinePayments)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.06)", borderRadius: "10px", borderLeft: "3px solid #FFB300", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>💳 Card</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#FFB300", wordBreak: "break-word" }}>{safeFormatPKR(cardPayments)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.04)", borderRadius: "10px", borderLeft: "3px solid #FF8F00", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>📱 JazzCash / Easypaisa</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "#FF8F00", wordBreak: "break-word" }}>{safeFormatPKR(jazzCashPayments)}</span>
            </div>
          </div>
          <hr style={{ borderColor: "rgba(255,215,0,0.2)", margin: "20px 0" }} />
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "#FFD700", marginBottom: "10px", fontSize: "18px" }}>📅 Monthly Report - {monthYear || new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}</h3>
            <p style={{ color: "#9ca3af", fontSize: "12px" }}>Report generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Modal for Plan Members */}
      {showModal && selectedPlan && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
              border: "2px solid #FFD700",
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#FFD700", margin: 0 }}>
                {getPlanIcon(selectedPlan)} {selectedPlan} Members
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255,68,68,0.2)",
                  border: "1px solid #ff4444",
                  color: "#ff4444",
                  fontSize: "20px",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ textAlign: "center", marginBottom: "20px", padding: "10px", background: "rgba(255,215,0,0.1)", borderRadius: "10px" }}>
              <p style={{ color: "#FFD700", fontSize: "18px", fontWeight: "bold" }}>
                Total Members: {getPlanMembers(selectedPlan).length}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {getPlanMembers(selectedPlan).length === 0 ? (
                <p style={{ textAlign: "center", color: "#9ca3af", padding: "30px" }}>No members found in this plan 😕</p>
              ) : (
                getPlanMembers(selectedPlan).map((member, index) => (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 15px",
                      background: "rgba(255,215,0,0.05)",
                      borderRadius: "8px",
                      borderLeft: `3px solid ${getPlanColor(selectedPlan)}`,
                      transition: "0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,215,0,0.1)";
                      e.currentTarget.style.transform = "translateX(3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,215,0,0.05)";
                      e.currentTarget.style.transform = "translateX(0px)";
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "16px", fontWeight: "bold", color: "#FFD700" }}>✓</span>
                      <span style={{ marginLeft: "10px", color: "white" }}>{member.name}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>📞 {member.phone}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "30px", flexWrap: "wrap" }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "linear-gradient(135deg, #FFD700, #B8860B)",
            color: "#0a0a0a",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🖨️ Print Report
        </button>

        <button
          onClick={() => {
            const summary = `🏋️ IBRAAJ FITNESS REPORT\n${monthYear || "Monthly Report"}\n\n━━━━━━━━━━━━━━━━━━━━\n\n📊 SUMMARY\n━━━━━━━━━━━━━━━━━━━━\n👥 Total Members: ${safeMembers.length}\n💰 Total Income: ${safeFormatPKR(totalIncome)}\n💸 Total Expenses: ${safeFormatPKR(totalExpense)}\n📈 Net Profit: ${safeFormatPKR(netProfit)}\n\n💳 PAYMENT BREAKDOWN\n━━━━━━━━━━━━━━━━━━━━\n💵 Cash: ${safeFormatPKR(cashPayments)}\n🌐 Online: ${safeFormatPKR(onlinePayments)}\n💳 Card: ${safeFormatPKR(cardPayments)}\n📱 JazzCash: ${safeFormatPKR(jazzCashPayments)}\n\n━━━━━━━━━━━━━━━━━━━━\n📍 IBRAAJ FITNESS GYM\n━━━━━━━━━━━━━━━━━━━━`;
            alert(summary);
          }}
          style={{
            background: "linear-gradient(135deg, #FFC107, #FF8F00)",
            color: "#0a0a0a",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📋 Quick Summary
        </button>
      </div>
    </div>
  );
}