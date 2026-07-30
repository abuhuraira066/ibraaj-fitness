import { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PaymentModal({ member, isOpen, onClose, onSuccess }) {
  const [receiveAmount, setReceiveAmount] = useState(member?.monthlyFee || "");
  const [receiveMethod, setReceiveMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !member) return null;

  const handleReceivePayment = async () => {
    if (!receiveAmount || Number(receiveAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const today = new Date();

      // 1️⃣ Update Member
      await updateDoc(doc(db, "members", member.id), {
        paidFee: Number(receiveAmount),
        paymentMethod: receiveMethod,
        feeStatus: "Paid",
        paidDate: today.toISOString().split("T")[0],
      });

      // 2️⃣ Payment History
      await addDoc(collection(db, "payments"), {
        memberId: member.id,
        memberCardId: member.memberId,
        name: member.name,
        amount: Number(receiveAmount),
        method: receiveMethod,
        date: today.toISOString().split("T")[0],
        time: today.toLocaleTimeString(),
        timestamp: serverTimestamp(),
      });

      // 3️⃣ Daily Collection
      await addDoc(collection(db, "dailyReports"), {
        memberName: member.name,
        amount: Number(receiveAmount),
        paymentMethod: receiveMethod,
        memberType: member.isNewAdmission ? "New Admission" : "Existing Member",
        date: today.toISOString().split("T")[0],
        time: today.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp: serverTimestamp(),
      });

      alert("✅ Payment Received Successfully");

      // Reset form
      setReceiveAmount("");
      setReceiveMethod("Cash");
      setLoading(false);

      // Close modal and refresh data
      if (onSuccess) {
        await onSuccess();
      }
      if (onClose) {
        onClose();
      }

    } catch (err) {
      console.error(err);
      alert("❌ Payment Failed: " + err.message);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "90%",
          background: "#111",
          padding: "30px",
          borderRadius: "15px",
          border: "2px solid #FFD700",
          boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
        }}
      >
        <h2 style={{ color: "#FFD700", textAlign: "center", marginBottom: "20px", fontFamily: "Orbitron, sans-serif" }}>
          💰 Receive Payment
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <p style={{ color: "#cbd5e1", marginBottom: "5px" }}>
            Member : <strong style={{ color: "#FFD700" }}>{member.name}</strong>
          </p>
          <p style={{ color: "#cbd5e1", marginBottom: "15px" }}>
            Monthly Fee : <strong style={{ color: "#00ff88" }}>Rs. {member.monthlyFee}</strong>
          </p>
        </div>

        <input
          type="number"
          value={receiveAmount}
          onChange={(e) => setReceiveAmount(e.target.value)}
          placeholder="Enter Amount"
          style={{
            width: "100%",
            padding: "12px 15px",
            marginBottom: "15px",
            background: "#0a0a0a",
            border: "1px solid #FFD700",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <select
          value={receiveMethod}
          onChange={(e) => setReceiveMethod(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            marginBottom: "20px",
            background: "#0a0a0a",
            border: "1px solid #FFD700",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            outline: "none",
          }}
        >
          <option>Cash</option>
          <option>Online</option>
          <option>Card</option>
          <option>JazzCash / Easypaisa</option>
        </select>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: "12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #6b7280",
              borderRadius: "8px",
              color: "#cbd5e1",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleReceivePayment}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              background: loading ? "linear-gradient(135deg,#666,#444)" : "linear-gradient(135deg,#00c853,#009624)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 5px 20px rgba(0,200,83,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {loading ? "⏳ Processing..." : "Receive Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}