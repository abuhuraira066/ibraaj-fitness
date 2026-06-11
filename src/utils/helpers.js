// src/utils/helpers.js

// Safe PKR Formatter
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

// Get Remaining Days (returns number of days)
export const getRemainingDaysNumber = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

// Get Remaining Days Text
export const getRemainingDaysText = (dueDate) => {
  if (!dueDate) return "Not Set";
  const days = getRemainingDaysNumber(dueDate);
  if (days > 0) return `${days} Days Left`;
  if (days === 0) return "Due Today";
  return `${Math.abs(days)} Days Overdue`;
};

// Get Remaining Days Color
export const getRemainingDaysColor = (dueDate) => {
  if (!dueDate) return "#9ca3af";
  const days = getRemainingDaysNumber(dueDate);
  if (days > 7) return "#00ff88";
  if (days > 0) return "#ffcc00";
  if (days === 0) return "#ffcc00";
  return "#ff4444";
};

// Get Remaining Days Type
export const getRemainingDaysType = (dueDate) => {
  if (!dueDate) return "not-set";
  const days = getRemainingDaysNumber(dueDate);
  if (days > 0) return "upcoming";
  if (days === 0) return "today";
  return "overdue";
};

// Get Remaining Days Object (for backward compatibility)
export const getRemainingDays = (dueDate) => {
  if (!dueDate) return null;
  const days = getRemainingDaysNumber(dueDate);
  if (days > 0) return { text: `${days} Days Left`, type: "upcoming", days: days };
  if (days === 0) return { text: "Due Today", type: "today", days: 0 };
  return { text: `${Math.abs(days)} Days Overdue`, type: "overdue", days: days };
};