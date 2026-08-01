import { formatCurrency, formatMonth, formatPercent } from '../utils/format'
import './MonthOverMonthChart.css'

const PLOT_HEIGHT = 130
const MIN_BAR_HEIGHT = 3

interface MonthOverMonthChartProps {
  data: { month: string; value: number }[]
}

interface Delta {
  label: string
  tone: 'up' | 'down' | 'flat'
}

// Percent change is only meaningful when both months share a sign. Crossing zero
// (or starting from it) makes the ratio explode or flip in a way that misleads
// rather than informs, so those cases get a qualitative label instead.
function monthOverMonthDelta(prev: number, curr: number): Delta {
  if (prev === 0) return { label: 'n/a', tone: 'flat' }
  if (Math.sign(prev) !== Math.sign(curr) && curr !== 0) {
    return curr > prev ? { label: '→ turned a profit', tone: 'up' } : { label: '→ turned a loss', tone: 'down' }
  }
  const pct = ((curr - prev) / Math.abs(prev)) * 100
  return { label: formatPercent(pct), tone: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
}

export function MonthOverMonthChart({ data }: MonthOverMonthChartProps) {
  const maxPositive = Math.max(0, ...data.map((d) => d.value))
  const maxNegative = Math.max(0, ...data.map((d) => -d.value))
  const totalMagnitude = maxPositive + maxNegative
  const positiveBand = totalMagnitude === 0 ? PLOT_HEIGHT : (PLOT_HEIGHT * maxPositive) / totalMagnitude
  const negativeBand = PLOT_HEIGHT - positiveBand

  return (
    <div className="mom-chart">
      <div className="mom-chart__row">
        {data.map((d, i) => {
          const isPositive = d.value >= 0
          const maxMagnitude = isPositive ? maxPositive : maxNegative
          const barHeight = maxMagnitude === 0 ? 0 : Math.max((Math.abs(d.value) / maxMagnitude) * (isPositive ? positiveBand : negativeBand), MIN_BAR_HEIGHT)
          const label = formatCurrency(d.value)
          const title = `${formatMonth(d.month)}: ${label}`

          return (
            <div key={d.month} className="mom-chart__col">
              <div className="mom-chart__zone mom-chart__zone--pos" style={{ height: positiveBand }}>
                {isPositive && (
                  <>
                    <span className="mom-chart__value">{label}</span>
                    <div
                      className="mom-chart__bar mom-chart__bar--pos"
                      style={{ height: barHeight }}
                      title={title}
                      aria-hidden="true"
                    />
                  </>
                )}
              </div>
              <div className="mom-chart__zone mom-chart__zone--neg" style={{ height: negativeBand }}>
                {!isPositive && (
                  <>
                    <div
                      className="mom-chart__bar mom-chart__bar--neg"
                      style={{ height: barHeight }}
                      title={title}
                      aria-hidden="true"
                    />
                    <span className="mom-chart__value">{label}</span>
                  </>
                )}
              </div>
              {i > 0 && (
                <div className="mom-chart__delta-anchor" style={{ top: positiveBand }}>
                  {(() => {
                    const delta = monthOverMonthDelta(data[i - 1].value, d.value)
                    const arrow = delta.tone === 'up' ? '▲' : delta.tone === 'down' ? '▼' : '–'
                    return (
                      <span className={`mom-chart__delta mom-chart__delta--${delta.tone}`}>
                        {arrow} {delta.label}
                      </span>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mom-chart__row mom-chart__row--labels">
        {data.map((d) => (
          <div key={d.month} className="mom-chart__col">
            <span className="mom-chart__month">{formatMonth(d.month)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
