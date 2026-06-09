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
  
  // Safe formatPKR function
  const safeFormatPKR = (amount) => {
    if (!amount && amount !== 0) return "Rs 0";
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

        {/* Plan Wise Report */}
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "25px", marginBottom: "25px", overflowX: "auto" }}>
          <h2 style={{ color: "#FFD700", textAlign: "center", marginBottom: "20px", fontFamily: "Orbitron, sans-serif", fontSize: "clamp(18px, 4vw, 24px)" }}>
            🏋️ Plan Wise Members Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.05)", borderRadius: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>💪 Self Training</span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#FFD700" }}>{safeMembers.filter(m => m?.plan === "Self Training").length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.05)", borderRadius: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>🏆 Training</span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#FFD700" }}>{safeMembers.filter(m => m?.plan === "Training").length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.05)", borderRadius: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>🏃 Cardio</span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#FFD700" }}>{safeMembers.filter(m => m?.plan === "Cardio").length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.05)", borderRadius: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>💪🏃 Self + Cardio</span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#FFD700" }}>{safeMembers.filter(m => m?.plan === "Self + Cardio").length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,215,0,0.05)", borderRadius: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px", color: "#cbd5e1" }}>🏆🏃 Training + Cardio</span>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#FFD700" }}>{safeMembers.filter(m => m?.plan === "Training + Cardio").length}</span>
            </div>
          </div>
        </div>

        {/* Payment Breakdown Report */}
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "25px", marginBottom: "25px", overflowX: "auto" }}>
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