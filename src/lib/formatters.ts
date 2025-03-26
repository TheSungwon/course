export function formatPlural(
  count: number,
  {
    singular,
    plural,
  }: {
    singular: string;
    plural: string;
  },
  { includeCount = true } = {}
) {
  const word = count === 1 ? singular : plural;

  return includeCount ? `${count} ${word}` : word;
}

export function formatPrice(amount: number, { showZeroAsAmount = false } = {}) {
  const formatter = new Intl.NumberFormat("ko-kr", {
    style: "currency",
    currency: "KRW",
    // minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, //USD일 때 적용
  });

  if (amount === 0 && !showZeroAsAmount) return "Free";

  return formatter.format(amount);
}
