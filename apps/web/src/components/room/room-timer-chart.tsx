import { cn } from "@pointly/ui/lib/utils"

type TimerCountdownChartProps = {
  progress: number
  className?: string
}

function describePieSlice(
  cx: number,
  cy: number,
  radius: number,
  progress: number
) {
  if (progress <= 0) return ""
  if (progress >= 1) {
    return `M ${cx} ${cy} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`
  }

  const angle = progress * 360
  const radians = ((angle - 90) * Math.PI) / 180
  const x = cx + radius * Math.cos(radians)
  const y = cy + radius * Math.sin(radians)
  const largeArc = angle > 180 ? 1 : 0

  return `M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y} Z`
}

export function TimerCountdownChart({
  progress,
  className,
}: TimerCountdownChartProps) {
  const size = 28
  const center = size / 2
  const radius = center - 1

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("size-7 shrink-0", className)}
      aria-hidden
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        className="fill-muted/40 stroke-border stroke"
      />
      <path
        d={describePieSlice(center, center, radius, progress)}
        className="fill-timer-progress"
      />
    </svg>
  )
}
