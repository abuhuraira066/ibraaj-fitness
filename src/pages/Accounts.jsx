import { useState } from "react";

export default function Accounts({
  expenses,
  expenseName,
  setExpenseName,
  expenseAmount,
  setExpenseAmount,
  addExpense,
  totalIncome,
  totalExpense,
  netProfit,
  formatPKR,
}) {
  
  // ✅ Password Lock - Owner Access
  const OWNER_PASSWORD = "Ibrahim@123";
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = () => {
    if (password === OWNER_PASSWORD) {
      setIsUnlocked(true);
    } else {
      alert("❌ Wrong Password");
      setPassword("");
    }
  };

  // ✅ Safe formatPKR function
  const safeFormatPKR = (amount) => {
    if (formatPKR && typeof formatPKR === 'function') {
      return formatPKR(amount);
    }
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // 🔒 Lock Screen
  if (!isUnlocked) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <div
          style={{
            background: "#111",
            padding: "40px",
            borderRadius: "15px",
            border: "1px solid #FFD700",
            width: "350px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#FFD700" }}>
            🔒 Owner Access
          </h2>

          <p style={{ color: "#bbb" }}>
            Enter Owner Password
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUnlock();
              }
            }}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "20px",
              borderRadius: "8px",
              border: "1px solid #FFD700",
              background: "#000",
              color: "white",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleUnlock}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              background: "#FFD700",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // ✅ Main Content (only visible when unlocked)
  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          color: "#FFD700",
          marginBottom: "30px",
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 10px #FFD700",
        }}
      >
        💰 Accounts Management
      </h1>

      {/* Summary Cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
            border: "2px solid #00ff99",
            padding: "25px",
            borderRadius: "15px",
            minWidth: "220px",
            textAlign: "center",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0,255,153,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <h3 style={{ color: "#cbd5e1", marginBottom: "10px" }}>💰 Total Income</h3>
          <h1 style={{ color: "#00ff99", fontSize: "36px", margin: "0" }}>
            {safeFormatPKR(totalIncome)}
          </h1>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
            border: "2px solid #ff4444",
            padding: "25px",
            borderRadius: "15px",
            minWidth: "220px",
            textAlign: "center",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,68,68,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <h3 style={{ color: "#cbd5e1", marginBottom: "10px" }}>💸 Total Expenses</h3>
          <h1 style={{ color: "#ff4444", fontSize: "36px", margin: "0" }}>
            {safeFormatPKR(totalExpense)}
          </h1>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
            border: (netProfit || 0) >= 0 ? "2px solid #FFD700" : "2px solid #ff4444",
            padding: "25px",
            borderRadius: "15px",
            minWidth: "220px",
            textAlign: "center",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,215,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <h3 style={{ color: "#cbd5e1", marginBottom: "10px" }}>📈 Net Profit</h3>
          <h1 style={{ color: (netProfit || 0) >= 0 ? "#FFD700" : "#ff4444", fontSize: "36px", margin: "0" }}>
            {safeFormatPKR(netProfit)}
          </h1>
        </div>
      </div>

      {/* Add Expense Form */}
      <div
        style={{
          background: "rgba(255,215,0,0.05)",
          border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: "20px",
          padding: "25px",
          marginBottom: "40px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#FFD700",
            marginBottom: "20px",
            fontSize: "22px",
          }}
        >
          ➕ Add New Expense
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Expense Name (e.g., Electricity Bill)"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            style={{
              background: "#0a0a0a",
              border: "1px solid #FFD700",
              color: "white",
              padding: "12px 18px",
              borderRadius: "10px",
              minWidth: "250px",
              outline: "none",
              fontSize: "14px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <input
            type="number"
            placeholder="Amount (PKR)"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            style={{
              background: "#0a0a0a",
              border: "1px solid #FFD700",
              color: "white",
              padding: "12px 18px",
              borderRadius: "10px",
              minWidth: "180px",
              outline: "none",
              fontSize: "14px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 10px rgba(255,215,0,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <button
            onClick={addExpense}
            style={{
              background: "linear-gradient(135deg, #FFD700, #B8860B)",
              color: "#0a0a0a",
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 5px 20px rgba(255,215,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ➕ Add Expense
          </button>
        </div>
      </div>

      {/* Expense History */}
      <h2
        style={{
          textAlign: "center",
          color: "#FFD700",
          marginBottom: "20px",
          fontSize: "24px",
        }}
      >
        📋 Expense History
      </h2>

      {!expenses || expenses.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            padding: "50px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "15px",
          }}
        >
          Koi expense nahi hai abhi 😕
          <br />
          Upar "Add Expense" button se expense add karein.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {expenses.map((expense) => (
            <div
              key={expense.id}
              style={{
                background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
                border: "1px solid #FFD700",
                borderRadius: "15px",
                padding: "20px",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "#FFD700";
                e.currentTarget.style.boxShadow = "0 5px 20px rgba(255,215,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.borderColor = "#FFD700";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ color: "#FFD700", margin: "0", fontSize: "18px" }}>
                  {expense.title}
                </h3>
                <span style={{ fontSize: "24px" }}>💸</span>
              </div>

              <h2
                style={{
                  color: "#ff4444",
                  fontSize: "28px",
                  margin: "10px 0",
                  textAlign: "center",
                }}
              >
                {safeFormatPKR(expense.amount)}
              </h2>

              <p
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  marginTop: "10px",
                  fontSize: "12px",
                }}
              >
                📅 {expense.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}