export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatMarginPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
    new Date(year, monthNum - 1, 1),
  )
}
