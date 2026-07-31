import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc, runTransaction } from "firebase/firestore";
import PaymentModal from "../components/PaymentModal";
import Receipt from "../components/Receipt";

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
  deleteMember,
  markAttendance,
  formatPKR,
  getPaymentColor,
}) {
  const navigate = useNavigate();
  const [viewFilter, setViewFilter] = useState("all");
  const [isNewAdmission, setIsNewAdmission] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const receiptRef = useRef(null);

  const safeFormatPKR = (amount) => {
    if (formatPKR && typeof formatPKR === 'function') return formatPKR(amount);
    return new Intl.NumberFormat("ur-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
  };

  const handleEdit = (member) => {
    setName(member.name); 
    setPhone(member.phone); 
    setPlan(member.plan); 
    setFeeStatus(member.feeStatus);
    setPaymentMethod(member.paymentMethod || "Cash"); 
    setMonthlyFee(member.monthlyFee || ""); 
    setPaidFee(member.paidFee || "");
    setDueDate(member.dueDate || ""); 
    setIsNewAdmission(member.isNewAdmission || false);
    setEditingId(member.id); 
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMarkAttendance = async (member) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await addDoc(collection(db, "attendanceHistory"), {
        memberId: member.id,
        memberCardId: member.memberId,
        name: member.name,
        phone: member.phone,
        plan: member.plan,
        date: today,
        status: "Present",
        timestamp: serverTimestamp(),
      });
      alert(`${member.name} marked Present for ${today}`);
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Error marking attendance!");
    }
  };

  const toggleNewAdmission = async (member) => {
    try {
      const newValue = member.isNewAdmission ? false : true;
      await updateDoc(doc(db, "members", member.id), {
        isNewAdmission: newValue
      });
      alert(`${member.name} ${newValue ? 'added to' : 'removed from'} New Admissions`);
      window.location.reload();
    } catch (error) {
      console.error("Error updating new admission:", error);
      alert("Error updating!");
    }
  };

  // ✅ Print Slip Function
  const handlePrintSlip = (member) => {
    // Create a temporary div with receipt content
    const receiptContent = document.createElement("div");
    receiptContent.id = "temp-receipt";
    receiptContent.style.display = "none";
    document.body.appendChild(receiptContent);

    // Render Receipt component content manually
    const formatPKR = (amount) => {
      return new Intl.NumberFormat("ur-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount || 0);
    };

    receiptContent.innerHTML = `
      <div id="receipt" style="width:700px;margin:20px auto;background:#fff;color:#000;padding:30px;font-family:Arial;border:2px solid #000;border-radius:8px;">
        <div style="text-align:center;margin-bottom:0;">
          <h1 style="margin-bottom:0;font-size:28px;">🏋️ IBRAAJ FITNESS</h1>
          <h3 style="margin-top:5px;color:#333;">PAYMENT RECEIPT</h3>
        </div>
        <hr style="border:1px solid #000;margin:15px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;width:40%;"><b>Member ID</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">${member.memberId}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Name</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">${member.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Phone</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">${member.phone}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Plan</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">${member.plan}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Monthly Fee</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">${formatPKR(member.monthlyFee)}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Paid Fee</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;color:#00a651;">${formatPKR(member.paidFee)}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Payment Method</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">${member.paymentMethod || "Cash"}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Due Date</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">${member.dueDate || "Not Set"}</td>
            </tr>
            <tr>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;font-weight:bold;color:#555;"><b>Status</b></td>
              <td style="padding:8px 5px;border-bottom:1px solid #eee;text-align:right;">
                <span style="color:${member.feeStatus === "Paid" ? "#00a651" : "#ff0000"};font-weight:bold;">
                  ${member.feeStatus}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <hr style="border:1px solid #000;margin:15px 0;">
        <div style="text-align:center;margin-top:20px;">
          <h3 style="margin:5px 0;color:#333;">Thank You For Choosing</h3>
          <h2 style="margin:5px 0;font-size:24px;">IBRAAJ FITNESS 💪</h2>
          <p style="margin-top:10px;color:#888;font-size:12px;">
            Generated: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `;

    // Print the receipt
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
          ${receiptContent.innerHTML}
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

    // Cleanup
    document.body.removeChild(receiptContent);
  };

  const getRemainingDaysData = (member) => {
    if (member.dueDate) {
      const today = new Date();
      const due = new Date(member.dueDate);
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      const remainingDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      
      if (remainingDays > 7) return { text: `${remainingDays} Days Left`, color: "#00ff88", type: "upcoming", days: remainingDays };
      if (remainingDays > 0) return { text: `${remainingDays} Days Left`, color: "#ffcc00", type: "upcoming", days: remainingDays };
      if (remainingDays === 0) return { text: "Due Today", color: "#ffcc00", type: "today", days: 0 };
      return { text: `${Math.abs(remainingDays)} Days Overdue`, color: "#ff4444", type: "overdue", days: remainingDays };
    }
    return { text: "Not Set", color: "#9ca3af", type: "not-set", days: null };
  };

  const getNewAdmissions = (allMembers) => {
    return allMembers.filter(m => m.isNewAdmission === true);
  };

  let displayMembers = Array.isArray(filteredMembers) ? filteredMembers : [];
  if (viewFilter === "newAdmissions") {
    displayMembers = getNewAdmissions(displayMembers);
  }

  const resetForm = () => {
    setName("");
    setPhone("");
    setPlan("Self Training");
    setFeeStatus("Unpaid");
    setPaymentMethod("Cash");
    setMonthlyFee("");
    setPaidFee("");
    setDueDate("");
    setIsNewAdmission(false);
    setEditingId(null);
  };

  const handleAddMember = async () => {
    if (!name || !phone) {
      alert("Name aur Phone likho");
      return;
    }
    
    let finalFeeStatus = feeStatus;
    let paidDateValue = null;
    
    if (feeStatus === "Paid" && paidFee && Number(paidFee) >= Number(monthlyFee)) {
      finalFeeStatus = "Paid";
      paidDateValue = new Date().toISOString().split("T")[0];
    }
    
    try {
      if (editingId) {
        await updateDoc(doc(db, "members", editingId), { 
          name, phone, plan, 
          feeStatus: finalFeeStatus, 
          paymentMethod, 
          monthlyFee, 
          paidFee, 
          paidDate: paidDateValue,
          dueDate: dueDate,
          isNewAdmission: isNewAdmission,
        });
        alert("✅ Member Updated");
        resetForm();
      } else {
        const counterRef = doc(db, "counters", "members");
        
        const memberId = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          if (!counterDoc.exists()) {
            throw new Error("Counter document not found!");
          }
          const lastId = counterDoc.data().lastId || 0;
          const nextId = lastId + 1;
          transaction.update(counterRef, { lastId: nextId });
          return `IBF-${String(nextId).padStart(4, "0")}`;
        });

        await updateDoc(doc(db, "counters", "members"), {
          lastId: parseInt(memberId.replace("IBF-", "")),
        });

        await addDoc(collection(db, "members"), { 
          memberId,
          name, 
          phone, 
          plan, 
          feeStatus: finalFeeStatus, 
          paymentMethod, 
          monthlyFee, 
          paidFee, 
          paidDate: paidDateValue,
          dueDate: dueDate,
          joinDate: new Date().toLocaleDateString(), 
          status: "active",
          isNewAdmission: isNewAdmission,
        });
        
        alert(`✅ Member Added — ID: ${memberId} ${isNewAdmission ? '🆕 (New Admission)' : ''}`);
        resetForm();
      }
      
      window.location.reload();
    } catch (error) {
      console.error("❌ Error in handleAddMember:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "#FFD700", marginBottom: "25px", fontFamily: "Orbitron, sans-serif" }}>👥 Members Management</h1>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px", background: "rgba(255,215,0,0.05)", padding: "25px", borderRadius: "20px" }}>
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
        
        <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00eaff", fontWeight: "bold", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isNewAdmission}
            onChange={(e) => setIsNewAdmission(e.target.checked)}
            style={{
              width: "18px",
              height: "18px",
              accentColor: "#00eaff",
              cursor: "pointer",
            }}
          />
          🆕 Mark as New Admission
        </label>
        
        <button onClick={handleAddMember} style={{ background: editingId ? "#FFB300" : "#FFD700", color: "#0a0a0a", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>{editingId ? "✏️ Update Member" : "➕ Add Member"}</button>
        {editingId && <button onClick={resetForm} style={{ background: "#6b7280", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "25px", flexWrap: "wrap" }}>
        <button
          onClick={() => setViewFilter("all")}
          style={{
            background: viewFilter === "all" ? "linear-gradient(135deg, #FFD700, #B8860B)" : "rgba(255,255,255,0.05)",
            border: viewFilter === "all" ? "none" : "1px solid #FFD700",
            color: viewFilter === "all" ? "#0a0a0a" : "#FFD700",
            padding: "10px 25px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.3s",
          }}
        >
          👥 All Members
        </button>
        <button
          onClick={() => setViewFilter("newAdmissions")}
          style={{
            background: viewFilter === "newAdmissions" ? "linear-gradient(135deg, #00eaff, #0066ff)" : "rgba(255,255,255,0.05)",
            border: viewFilter === "newAdmissions" ? "none" : "1px solid #00eaff",
            color: viewFilter === "newAdmissions" ? "white" : "#00eaff",
            padding: "10px 25px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.3s",
          }}
        >
          🆕 New Admissions ({getNewAdmissions(members).length})
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input placeholder="🔍 Search by Name / Phone / ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: "350px", padding: "12px 20px", background: "#0a0a0a", border: "1px solid #FFD700", color: "white", borderRadius: "12px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
        {displayMembers.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9ca3af", gridColumn: "1/-1" }}>
            {viewFilter === "newAdmissions" ? "No members marked as New Admissions 😕" : "Koi member nahi mila 😕"}
          </p>
        ) : (
          displayMembers.map((member) => {
            const remainingData = getRemainingDaysData(member);
            const isOverdue = remainingData.type === "overdue";
            const isDueSoon = remainingData.type === "upcoming" && remainingData.days <= 7;
            
            return (
              <div key={member.id} onClick={() => navigate(`/member/${member.memberId}`)} style={{ cursor: "pointer", background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)", border: isOverdue ? "2px solid #ff4444" : isDueSoon ? "2px solid #ffcc00" : "1px solid #FFD700", borderRadius: "15px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <span style={{ display: "inline-block", background: "rgba(255,215,0,0.15)", color: "#FFD700", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>🆔 {member.memberId || "—"}</span>
                    {member.isNewAdmission && (
                      <span style={{ marginLeft: "10px", background: "#00eaff", color: "#0a0a0a", padding: "3px 12px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}>🆕 New</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNewAdmission(member);
                      }}
                      style={{
                        background: member.isNewAdmission ? "rgba(0,234,255,0.2)" : "rgba(255,255,255,0.05)",
                        border: member.isNewAdmission ? "1px solid #00eaff" : "1px solid #6b7280",
                        color: member.isNewAdmission ? "#00eaff" : "#9ca3af",
                        padding: "4px 12px",
                        borderRadius: "15px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                        transition: "0.3s",
                      }}
                    >
                      {member.isNewAdmission ? "✅ New" : "➕ Mark New"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                        setShowPaymentModal(true);
                      }}
                      style={{
                        background: "linear-gradient(135deg,#00c853,#009624)",
                        color: "#fff",
                        border: "none",
                        padding: "4px 12px",
                        borderRadius: "15px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                        transition: "0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      💰 Pay
                    </button>
                    {/* ✅ Print Slip Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintSlip(member);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #FFD700, #B8860B)",
                        color: "#0a0a0a",
                        border: "none",
                        padding: "4px 12px",
                        borderRadius: "15px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                        transition: "0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      🧾 Slip
                    </button>
                  </div>
                </div>
                
                <h2 style={{ color: "#FFD700" }}>{member.name}</h2>
                <p>📞 {member.phone}</p>
                <p>📅 Joined: {member.joinDate || "—"}</p>
                <p>💪 {member.plan}</p>
                <hr />
                <p>💳 Status: <strong style={{ color: member.feeStatus === "Paid" ? "#00ff99" : "#ff4444" }}>{member.feeStatus}</strong></p>
                <p>💳 Method: <strong style={{ color: getPaymentColor(member.paymentMethod) }}>{member.paymentMethod || "Cash"}</strong></p>
                <p>💵 Monthly: {safeFormatPKR(member.monthlyFee)}</p>
                <p>✅ Paid: {safeFormatPKR(member.paidFee)}</p>
                
                {remainingData.type !== "not-set" ? (
                  <>
                    <p>⏳ <span style={{ color: remainingData.color, fontWeight: "bold" }}>{remainingData.text}</span></p>
                  </>
                ) : (
                  <p>📅 Due: Not Set</p>
                )}
                
                {isOverdue && <p style={{ color: "#ff4444", fontWeight: "bold", marginTop: "5px" }}>⚠️ Fee Expired! Please renew.</p>}
                
                <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEdit(member)} style={{ background: "#FFB300", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>✏️ Edit</button>
                  <button onClick={() => handleMarkAttendance(member)} style={{ background: "#00ff99", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>✅ Present</button>
                  <button onClick={() => deleteMember(member.id)} style={{ background: "#ff4444", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>🗑️ Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        member={selectedMember}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedMember(null);
        }}
        onSuccess={() => {
          setShowPaymentModal(false);
          setSelectedMember(null);
          window.location.reload();
        }}
      />
    </div>
  );
}