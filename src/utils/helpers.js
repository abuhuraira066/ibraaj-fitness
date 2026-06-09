// src/utils/helpers.js

export const safeFormatPKR = (amount, formatPKR = null) => {
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

export const getRemainingDays = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return { text: `${diffDays} Days Left`, type: "upcoming", days: diffDays };
  if (diffDays === 0) return { text: "Due Today", type: "today", days: 0 };
  return { text: `${Math.abs(diffDays)} Days Overdue`, type: "overdue", days: diffDays };
};

export const getRemainingDaysText = (dueDate) => {
  const result = getRemainingDays(dueDate);
  return result ? result.text : "Not Set";
};

export const getRemainingDaysColor = (dueDate) => {
  const result = getRemainingDays(dueDate);
  if (!result) return "#9ca3af";
  if (result.type === "overdue") return "#ff4444";
  if (result.type === "today") return "#ffcc00";
  return "#00ff88";
};