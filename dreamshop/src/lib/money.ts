export function formatMoney(amount: number) {
  const value = Math.round(amount);
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${formatted}f`;
}
