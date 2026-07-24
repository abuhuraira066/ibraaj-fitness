export default function Receipt({ member }) {
  if (!member) return null;

  const formatPKR = (amount) => {
    return new Intl.NumberFormat("ur-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div
      id="receipt"
      style={{
        display: "none",
        width: "700px",
        margin: "auto",
        background: "#fff",
        color: "#000",
        padding: "30px",
        fontFamily: "Arial",
        border: "2px solid #000",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "0" }}>
        <h1 style={{ marginBottom: "0", fontSize: "28px" }}>🏋️ IBRAAJ FITNESS</h1>
        <h3 style={{ marginTop: "5px", color: "#333" }}>PAYMENT RECEIPT</h3>
      </div>

      <hr style={{ border: "1px solid #000", margin: "15px 0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555", width: "40%" }}><b>Member ID</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>{member.memberId}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Name</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>{member.name}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Phone</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>{member.phone}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Plan</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>{member.plan}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Monthly Fee</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>{formatPKR(member.monthlyFee)}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Paid Fee</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right", fontWeight: "bold", color: "#00a651" }}>{formatPKR(member.paidFee)}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Payment Method</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>{member.paymentMethod || "Cash"}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Due Date</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>{member.dueDate || "Not Set"}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", fontWeight: "bold", color: "#555" }}><b>Status</b></td>
            <td style={{ padding: "8px 5px", borderBottom: "1px solid #eee", textAlign: "right" }}>
              <span style={{ color: member.feeStatus === "Paid" ? "#00a651" : "#ff0000", fontWeight: "bold" }}>
                {member.feeStatus}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <hr style={{ border: "1px solid #000", margin: "15px 0" }} />

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h3 style={{ margin: "5px 0", color: "#333" }}>Thank You For Choosing</h3>
        <h2 style={{ margin: "5px 0", fontSize: "24px" }}>IBRAAJ FITNESS 💪</h2>
        <p style={{ marginTop: "10px", color: "#888", fontSize: "12px" }}>
          Generated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}