/**
 * 格式化數字為金額顯示格式（加入千分位逗號）
 * @param {number|string} value - 要格式化的數字
 * @param {boolean} showCurrency - 是否顯示 $ 符號，預設為 true
 * @param {number} decimals - 小數位數，預設為 0
 * @returns {string} 格式化後的數字字串
 * 
 * @example
 * formatPrice(12000) // "$12,000"
 * formatPrice(12000, false) // "12,000"
 * formatPrice(12000, true, 2) // "$12,000.00"
 * formatPrice(12000.5, true, 2) // "$12,000.50"
 */
export function formatPrice(value, showCurrency = true, decimals = 0) {
  const num = Number(value);
  
  if (isNaN(num)) {
    return value;
  }
  
  const formatted = num.toLocaleString('zh-TW', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return showCurrency ? `$${formatted}` : formatted;
}
