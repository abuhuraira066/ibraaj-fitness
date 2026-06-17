import { useState } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";

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
  
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  // ✅ Get New Admissions (members with isNewAdmission = true)
  const getNewAdmissions = () => {
    return safeMembers.filter(m => m.isNewAdmission === true);
  };

  // Plan configurations - ✅ New Admissions added as first item
  const plans = [
    { key: "New Admissions", icon: "🆕", name: "New Admissions", color: "#00eaff", isAdmission: true },
    { key: "Self Training", icon: "💪", name: "Self Training", color: "#FFD700" },
    { key: "Training", icon: "🏆", name: "Training", color: "#FFC107" },
    { key: "Cardio", icon: "🏃", name: "Cardio", color: "#FFB300" },
    { key: "Self + Cardio", icon: "💪🏃", name: "Self + Cardio", color: "#00ff88" },
    { key: "Training + Cardio", icon: "🏆🏃", name: "Training + Cardio", color: "#0099ff" },
  ];

  const handlePlanClick = (planName) => {
    if (planName === "New Admissions") {
      // Show modal for New Admissions members
      setSelectedPlan(planName);
      setShowModal(true);
      return;
    }
    setSelectedPlan(planName);
    setShowModal(true);
  };

  const getPlanMembers = (planName) => {
    if (planName === "New Admissions") {
      return getNewAdmissions();
    }
    return safeMembers.filter(m => m?.plan === planName);
  };

  // ✅ Reset New Admissions
  const resetNewAdmissions = async () => {
    if (window.confirm(`⚠️ Reset New Admissions?\n\nAll members marked as "New Admission" will be removed.\n\nThis action cannot be undone!\n\nAre you sure?`)) {
      setResetting(true);
      try {
        const membersToReset = getNewAdmissions();
        
        if (membersToReset.length === 0) {
          alert("No members in New Admissions to reset.");
          setResetting(false);
          return;
        }
        
        const batch = writeBatch(db);
        
        membersToReset.forEach(member => {
          const memberRef = doc(db, "members", member.id);
          batch.update(memberRef, { isNewAdmission: false });
        });
        
        await batch.commit();
        alert(`✅ ${membersToReset.length} members removed from New Admissions.`);
        window.location.reload();
      } catch (error) {
        console.error("Error resetting new admissions:", error);
        alert("Error resetting new admissions!");
      } finally {
        setResetting(false);
      }
    }
  };

  // ✅ Reset Single Plan
  const resetPlan = async (planName) => {
    if (window.confirm(`⚠️ Reset "${planName}" plan?\n\nAll members in this plan will be moved to "No Plan".\n\nThis action cannot be undone!\n\nAre you sure?`)) {
      setResetting(true);
      try {
        const membersToReset = safeMembers.filter(m => m.plan === planName);
        
        if (membersToReset.length === 0) {
          alert(`No members in "${planName}" plan to reset.`);
          setResetting(false);
          return;
        }
        
        const batch = writeBatch(db);
        
        membersToReset.forEach(member => {
          const memberRef = doc(db, "members", member.id);
          batch.update(memberRef, { plan: "" });
        });
        
        await batch.commit();
        alert(`✅ ${membersToReset.length} members removed from "${planName}" plan.`);
        window.location.reload();
      } catch (error) {
        console.error("Error resetting plan:", error);
        alert("Error resetting plan!");
      } finally {
        setResetting(false);
      }
    }
  };

  // ✅ Reset All Expenses
  const resetAllExpenses = async () => {
    if (window.confirm(`⚠️ RESET ALL EXPENSES ⚠️\n\nThis will delete ALL expense records.\n\nThis action cannot be undone!\n\nAre you sure?`)) {
      setResetting(true);
      try {
        const expensesRef = collection(db, "expenses");
        const expensesSnapshot = await getDocs(expensesRef);
        const batch = writeBatch(db);
        
        expensesSnapshot.docs.forEach(expenseDoc => {
          batch.delete(expenseDoc.ref);
        });
        
        await batch.commit();
        alert("✅ All expenses have been deleted!");
        window.location.reload();
      } catch (error) {
        console.error("Error resetting expenses:", error);
        alert("Error resetting expenses!");
      } finally {
        setResetting(false);
      }
    }
  };

  // ✅ Reset All Members' Paid Fees
  const resetAllPayments = async () => {
    if (window.confirm(`⚠️ RESET ALL PAYMENTS ⚠️\n\nThis will set ALL members' paidFee to 0 and status to Unpaid.\n\nThis action cannot be undone!\n\nAre you sure?`)) {
      setResetting(true);
      try {
        const batch = writeBatch(db);
        
        safeMembers.forEach(member => {
          const memberRef = doc(db, "members", member.id);
          batch.update(memberRef, { 
            paidFee: "0",
            feeStatus: "Unpaid",
            paidDate: null
          });
        });
        
        await batch.commit();
        alert(`✅ All ${safeMembers.length} members' payments have been reset!`);
        window.location.reload();
      } catch (error) {
        console.error("Error resetting payments:", error);
        alert("Error resetting payments!");
      } finally {
        setResetting(false);
      }
    }
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

  const newAdmissionsCount = getNewAdmissions().length;

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

      {/* Action Buttons Row */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={downloadPDF}
          style={{
            background: "linear-gradient(135deg, #FFD700, #B8860B)",
            color: "#0a0a0a",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          📄 PDF
        </button>
        
        <button
          onClick={resetAllExpenses}
          disabled={resetting}
          style={{
            background: "linear-gradient(135deg, #ff4444, #cc0000)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🗑️ Reset Expenses
        </button>
        
        <button
          onClick={resetAllPayments}
          disabled={resetting}
          style={{
            background: "linear-gradient(135deg, #ff8800, #cc6600)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          💰 Reset Payments
        </button>

        <button
          onClick={() => navigate("/month-closing")}
          style={{
            background: "linear-gradient(135deg, #FFD700, #B8860B)",
            color: "#0a0a0a",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🔒 Month Closing
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

        {/* Plan Wise Report - with New Admissions at top */}
        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "15px", padding: "25px", marginBottom: "25px" }}>
          <h2 style={{ color: "#FFD700", textAlign: "center", marginBottom: "20px", fontFamily: "Orbitron, sans-serif", fontSize: "clamp(18px, 4vw, 24px)" }}>
            🏋️ Plan Wise Members Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {plans.map((plan) => {
              const planMembers = getPlanMembers(plan.key);
              const count = planMembers.length;
              const isAdmission = plan.isAdmission;
              
              return (
                <div 
                  key={plan.key}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "15px 20px", 
                    background: isAdmission ? "rgba(0,234,255,0.08)" : "rgba(255,215,0,0.05)", 
                    borderRadius: "10px", 
                    flexWrap: "wrap",
                    gap: "10px",
                    border: isAdmission ? "1px solid rgba(0,234,255,0.3)" : "none",
                  }}
                >
                  <div 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px", 
                      cursor: "pointer", 
                      flex: 1 
                    }}
                    onClick={() => handlePlanClick(plan.key)}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    <span style={{ fontSize: "24px" }}>{plan.icon}</span>
                    <span style={{ fontSize: "16px", color: isAdmission ? "#00eaff" : "#cbd5e1", fontWeight: "bold" }}>
                      {plan.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ 
                      fontSize: "22px", 
                      fontWeight: "bold", 
                      color: isAdmission ? "#00eaff" : plan.color 
                    }}>
                      {count}
                    </span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                      members
                    </span>
                    {isAdmission ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetNewAdmissions();
                        }}
                        disabled={resetting || count === 0}
                        style={{
                          background: "rgba(255,68,68,0.15)",
                          border: "1px solid #ff4444",
                          color: "#ff4444",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: count === 0 ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                          transition: "0.3s",
                          opacity: count === 0 ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (count > 0) {
                            e.currentTarget.style.background = "#ff4444";
                            e.currentTarget.style.color = "white";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (count > 0) {
                            e.currentTarget.style.background = "rgba(255,68,68,0.15)";
                            e.currentTarget.style.color = "#ff4444";
                          }
                        }}
                      >
                        🔄 Reset
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetPlan(plan.key);
                        }}
                        disabled={resetting || count === 0}
                        style={{
                          background: "rgba(255,68,68,0.15)",
                          border: "1px solid #ff4444",
                          color: "#ff4444",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: count === 0 ? "not-allowed" : "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                          transition: "0.3s",
                          opacity: count === 0 ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (count > 0) {
                            e.currentTarget.style.background = "#ff4444";
                            e.currentTarget.style.color = "white";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (count > 0) {
                            e.currentTarget.style.background = "rgba(255,68,68,0.15)";
                            e.currentTarget.style.color = "#ff4444";
                          }
                        }}
                      >
                        🔄 Reset
                      </button>
                    )}
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
    </div>
  );
}