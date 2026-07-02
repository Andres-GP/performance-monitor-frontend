import { memo } from "react"

function cellColor(v: number): string {
  // Positive correlation -> chart-2 (red-ish risk), negative -> chart-1 (green).
  const intensity = Math.min(Math.abs(v), 1)
  if (v >= 0) {
    return `color-mix(in oklab, var(--color-chart-2) ${Math.round(intensity * 70)}%, var(--color-card))`
  }
  return `color-mix(in oklab, var(--color-chart-1) ${Math.round(intensity * 70)}%, var(--color-card))`
}

export const CorrelationHeatmap = memo(function CorrelationHeatmap({
  strategies,
  matrix,
}: {
  strategies: string[]
  matrix: number[][]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="p-1" />
            {strategies.map((s) => (
              <th key={s} className="p-1 text-center font-medium text-muted-foreground">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th className="whitespace-nowrap p-1 text-right font-medium text-muted-foreground">
                {strategies[i]}
              </th>
              {row.map((v, j) => (
                <td
                  key={j}
                  className="h-12 w-16 rounded-md text-center align-middle font-medium tabular-nums"
                  style={{ background: cellColor(v) }}
                  title={`${strategies[i]} / ${strategies[j]}: ${v.toFixed(2)}`}
                >
                  {v.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
