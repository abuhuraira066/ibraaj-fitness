import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Attendance from "./pages/Attendance";
import Accounts from "./pages/Accounts";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MonthClosing from "./pages/MonthClosing";

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, background: "linear-gradient(135deg, #050505, #111111, #1a1200)", minHeight: "100vh", padding: "35px" }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("Self Training");
  const [feeStatus, setFeeStatus] = useState("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [paidFee, setPaidFee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const membersRef = collection(db, "members");
  const expensesRef = collection(db, "expenses");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMembers = async () => {
    console.log("🔄 Fetching members from Firebase...");
    try {
      const querySnapshot = await getDocs(membersRef);
      console.log("📄 Query Snapshot Size:", querySnapshot.size);
      
      if (querySnapshot.size === 0) {
        console.warn("⚠️ No documents found in members collection!");
        setMembers([]);
        return;
      }
      
      const membersData = [];
      querySnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() });
      });
      
      membersData.sort((a, b) => {
        const numA = parseInt((a.memberId || "IBF-0000").replace("IBF-", ""));
        const numB = parseInt((b.memberId || "IBF-0000").replace("IBF-", ""));
        return numA - numB;
      });
      
      console.log("✅ Total Members Loaded:", membersData.length);
      setMembers(membersData);
    } catch (error) {
      console.error("❌ Error fetching members:", error);
    }
  };

  const fetchExpenses = async () => {
    const data = await getDocs(expensesRef);
    setExpenses(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchMembers();
    fetchExpenses();
  }, []);

  // Auto calculate remaining days for due count
  const getRemainingDaysCount = (member) => {
    if (member.feeStatus === "Paid" && Number(member.paidFee) >= Number(member.monthlyFee)) {
      const baseDate = member.paidDate ? new Date(member.paidDate) : new Date(member.joinDate);
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + 30);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    }
    if (member.dueDate) {
      const today = new Date();
      const due = new Date(member.dueDate);
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  const dueTodayCount = members.filter(m => {
    const days = getRemainingDaysCount(m);
    return days !== null && days <= 0;
  }).length;

  const totalIncome = members.reduce((sum, m) => sum + Number(m.paidFee || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;

  const cashPayments = members.reduce((sum, m) => sum + (m.paymentMethod === "Cash" ? Number(m.paidFee || 0) : 0), 0);
  const onlinePayments = members.reduce((sum, m) => sum + (m.paymentMethod === "Online" ? Number(m.paidFee || 0) : 0), 0);
  const cardPayments = members.reduce((sum, m) => sum + (m.paymentMethod === "Card" ? Number(m.paidFee || 0) : 0), 0);
  const jazzCashPayments = members.reduce((sum, m) => sum + (m.paymentMethod === "JazzCash / Easypaisa" ? Number(m.paidFee || 0) : 0), 0);

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone?.includes(searchQuery) ||
    (m.memberId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Updated addMember with Counter-Based ID System + Debug Logs + Verification
  const addMember = async () => {
    if (!name || !phone) {
      alert("Name aur Phone likho");
      return;
    }

    let finalFeeStatus = feeStatus;
    let paidDateValue = null;

    if (
      feeStatus === "Paid" &&
      paidFee &&
      Number(paidFee) >= Number(monthlyFee)
    ) {
      finalFeeStatus = "Paid";
      paidDateValue = new Date().toISOString().split("T")[0];
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "members", editingId), {
          name,
          phone,
          plan,
          feeStatus: finalFeeStatus,
          paymentMethod,
          monthlyFee,
          paidFee,
          paidDate: paidDateValue,
        });

        alert("✅ Member Updated");
        setEditingId(null);
      } else {
        // ✅ Professional Counter - Transaction based ID generation
        const counterRef = doc(db, "counters", "members");

        console.log("🔄 Starting transaction...");
        
        const memberId = await runTransaction(db, async (transaction) => {
          console.log("📥 Getting counter document...");
          const counterDoc = await transaction.get(counterRef);

          console.log("📄 Counter exists:", counterDoc.exists());

          if (!counterDoc.exists()) {
            console.error("❌ Counter document not found!");
            throw new Error(
              "Counter document not found. Please create counters/members."
            );
          }

          const lastId = counterDoc.data().lastId || 0;
          const nextId = lastId + 1;

          console.log("🔢 Last ID:", lastId);
          console.log("🔢 Next ID:", nextId);

          console.log("📝 Updating counter...");
          transaction.update(counterRef, {
            lastId: nextId,
          });

          console.log("✅ Counter update scheduled");

          return `IBF-${String(nextId).padStart(4, "0")}`;
        });

        console.log("🆕 Generated Member ID:", memberId);

        // ✅ VERIFY: Counter ko manual update karo (safety check)
        await updateDoc(doc(db, "counters", "members"), {
          lastId: parseInt(memberId.replace("IBF-", "")),
        });

        console.log("✅ Counter Updated!");

        console.log("💾 Adding member to database...");

        await addDoc(membersRef, {
          memberId,
          name,
          phone,
          plan,
          feeStatus: finalFeeStatus,
          paymentMethod,
          monthlyFee,
          paidFee,
          paidDate: paidDateValue,
          joinDate: new Date().toLocaleDateString(),
          status: "active",
        });

        console.log("✅ Member added successfully!");
        alert("✅ Member Added — ID: " + memberId);
      }

      setName("");
      setPhone("");
      setPlan("Self Training");
      setFeeStatus("Unpaid");
      setPaymentMethod("Cash");
      setMonthlyFee("");
      setPaidFee("");
      setDueDate("");

      await fetchMembers();
    } catch (error) {
      console.error("❌ Error in addMember:", error);
      alert(error.message);
    }
  };

  // ✅ Fix Duplicate IDs - Only rename duplicate members
  const fixDuplicateIDs = async () => {
    const ids = {};
    const duplicates = [];
    
    members.forEach(member => {
      if (member.memberId) {
        if (ids[member.memberId]) {
          duplicates.push(member);
        } else {
          ids[member.memberId] = true;
        }
      }
    });
    
    if (duplicates.length === 0) {
      alert("No duplicate IDs found! ✅");
      return;
    }
    
    // Get highest ID
    const lastNumber = members.reduce((max, member) => {
      const num = parseInt(
        (member.memberId || "IBF-0000").replace("IBF-", "")
      ) || 0;
      return Math.max(max, num);
    }, 0);
    
    let nextNumber = lastNumber + 1;
    
    for (const member of duplicates) {
      const newId = `IBF-${String(nextNumber).padStart(4, "0")}`;
      await updateDoc(doc(db, "members", member.id), {
        memberId: newId
      });
      nextNumber++;
    }
    
    alert(`✅ ${duplicates.length} duplicate IDs fixed!`);
    fetchMembers();
  };

  const deleteMember = async (id) => { 
    await deleteDoc(doc(db, "members", id)); 
    fetchMembers(); 
  };
  
  const markAttendance = async (member) => {
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
  
  const addExpense = async () => {
    if (!expenseName || !expenseAmount) { 
      alert("Expense Name aur Amount likho"); 
      return; 
    }
    await addDoc(expensesRef, { 
      title: expenseName, 
      amount: Number(expenseAmount), 
      date: new Date().toLocaleDateString() 
    });
    setExpenseName(""); 
    setExpenseAmount("");
    fetchExpenses();
    alert("Expense Added");
  };
  
  const deleteExpense = async (id) => {
    if (window.confirm("Delete this expense?")) { 
      await deleteDoc(doc(db, "expenses", id)); 
      fetchExpenses(); 
      alert("Expense deleted!"); 
    }
  };

  const todayStr = currentTime.toLocaleDateString("en-GB");
  const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const monthYear = currentTime.toLocaleString("en-US", { month: "long", year: "numeric" });

  const formatPKR = (amount) => {
    return new Intl.NumberFormat("ur-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getPaymentColor = (method) => {
    switch(method) {
      case "Cash": return "#FFD700";
      case "Online": return "#FFC107";
      case "Card": return "#FFB300";
      default: return "#FFD700";
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard members={members} dueTodayCount={dueTodayCount} totalIncome={totalIncome} totalExpense={totalExpense} netProfit={netProfit} cashPayments={cashPayments} onlinePayments={onlinePayments} cardPayments={cardPayments} jazzCashPayments={jazzCashPayments} formatPKR={formatPKR} /></Layout></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Layout><Members members={members} filteredMembers={filteredMembers} searchQuery={searchQuery} setSearchQuery={setSearchQuery} name={name} setName={setName} phone={phone} setPhone={setPhone} plan={plan} setPlan={setPlan} feeStatus={feeStatus} setFeeStatus={setFeeStatus} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} monthlyFee={monthlyFee} setMonthlyFee={setMonthlyFee} paidFee={paidFee} setPaidFee={setPaidFee} dueDate={dueDate} setDueDate={setDueDate} editingId={editingId} setEditingId={setEditingId} addMember={addMember} deleteMember={deleteMember} markAttendance={markAttendance} formatPKR={formatPKR} getPaymentColor={getPaymentColor} /></Layout></ProtectedRoute>} />
          <Route path="/member/:id" element={<ProtectedRoute><Layout><MemberProfile /></Layout></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Layout><Attendance /></Layout></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><Layout><Accounts expenses={expenses} expenseName={expenseName} setExpenseName={setExpenseName} expenseAmount={expenseAmount} setExpenseAmount={setExpenseAmount} addExpense={addExpense} totalIncome={totalIncome} totalExpense={totalExpense} netProfit={netProfit} formatPKR={formatPKR} /></Layout></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses expenseName={expenseName} setExpenseName={setExpenseName} expenseAmount={expenseAmount} setExpenseAmount={setExpenseAmount} addExpense={addExpense} deleteExpense={deleteExpense} expenses={expenses} formatPKR={formatPKR} /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports members={members} totalIncome={totalIncome} totalExpense={totalExpense} netProfit={netProfit} cashPayments={cashPayments} onlinePayments={onlinePayments} cardPayments={cardPayments} jazzCashPayments={jazzCashPayments} monthYear={monthYear} formatPKR={formatPKR} /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          
          <Route path="/month-closing" element={
            <ProtectedRoute>
              <Layout>
                <MonthClosing members={members} />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        
        <div style={{ position: "fixed", bottom: "10px", right: "10px", zIndex: 999 }}>
          <button
            onClick={fixDuplicateIDs}
            style={{
              background: "linear-gradient(135deg, #ff8800, #cc6600)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            🔧 Fix Duplicate IDs
          </button>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;