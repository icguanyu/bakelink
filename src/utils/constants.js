/**
 * 排程狀態選項
 */
export const scheduleStatusOptions = [
  { label: "草稿", value: "DRAFT" },
  { label: "預告", value: "ANNOUNCED" },
  { label: "收單中", value: "OPEN" },
  { label: "已結單", value: "CLOSED" },
  { label: "出貨結束", value: "FULFILLED" },
];

/**
 * 訂單狀態選項
 */
export const orderStatusOptions = [
  { label: "全部", value: "all", color: "" },
  { label: "已下單", value: "ordered", color: "#3b82f6", count: 0 },
  { label: "已完成", value: "completed", color: "#10b981", count: 0 },
  { label: "已取消", value: "cancelled", color: "#ef4444", count: 0 },
];
