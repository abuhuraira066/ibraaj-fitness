export default function Expenses({
  expenseName,
  setExpenseName,
  expenseAmount,
  setExpenseAmount,
  addExpense,
  deleteExpense,
  expenses,
  formatPKR,
}) {
  
  // ✅ Safe formatPKR function
  const safeFormatPKR = (amount) => {
    if (formatPKR && typeof formatPKR === 'function') {
      return formatPKR(amount);
    }
    if (amount === undefined || amount === null) return "Rs 0";
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // Safe expenses array
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  return (
    <div>
      <h1
        style={{
          color: "#FFD700",
          textAlign: "center",
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 10px #FFD700",
          marginBottom: "30px",
        }}
      >
        💸 Expenses Management
      </h1>

      {/* Add Expense Form */}
      <div
        style={{
          textAlign: "center",
          margin: "30px 0 40px",
          background: "rgba(255,215,0,0.05)",
          padding: "30px",
          borderRadius: "20px",
          border: "1px solid rgba(255,215,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Expense Name"
            value={expenseName || ""}
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
            value={expenseAmount || ""}
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
          color: "#FFD700",
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "24px",
        }}
      >
        📋 Expense History
      </h2>

      {safeExpenses.length === 0 ? (
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
          {safeExpenses.map((expense, index) => (
            <div
              key={expense.id || index}
              style={{
                background: "linear-gradient(135deg, #0a0a0a, #0f0f0f)",
                border: "1px solid #FFD700",
                borderRadius: "15px",
                padding: "20px",
                transition: "0.3s",
                animation: `fadeIn 0.3s ease ${index * 0.05}s`,
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
                  {expense.title || "Unknown"}
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
                📅 {expense.date || "N/A"}
              </p>

              {deleteExpense && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "15px",
                    paddingTop: "10px",
                    borderTop: "1px solid rgba(255,215,0,0.1)",
                  }}
                >
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    style={{
                      background: "rgba(255,68,68,0.15)",
                      border: "1px solid #ff4444",
                      color: "#ff4444",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                      transition: "0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ff4444";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,68,68,0.15)";
                      e.currentTarget.style.color = "#ff4444";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0px);
            }
          }
        `}
      </style>
    </div>
  );
}