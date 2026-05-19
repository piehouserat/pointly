import { AnimatePresence, motion } from "motion/react"

const DIGIT_ENTER_MS = 200
const DIGIT_EXIT_MS = 150
/** Time each digit stays visible (enter + hold + exit fits within one tick). */
export const COUNTDOWN_TICK_MS = DIGIT_ENTER_MS + DIGIT_EXIT_MS + 400

const digitEase = [0.22, 1, 0.36, 1] as const
const digitExitEase = [0.4, 0, 0.2, 1] as const

type RevealCountdownProps = {
  value: number
}

export function RevealCountdown({ value }: RevealCountdownProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-2xl"
      aria-live="assertive"
      aria-atomic
      role="status"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: DIGIT_ENTER_MS / 1000, ease: digitEase },
          }}
          exit={{
            opacity: 0,
            y: -8,
            scale: 0.96,
            transition: { duration: DIGIT_EXIT_MS / 1000, ease: digitExitEase },
          }}
          className="text-4xl font-bold tracking-tight text-primary tabular-nums will-change-transform sm:text-5xl"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export function runRevealCountdown(
  onTick: (value: number) => void,
  seconds = 3,
  tickMs = COUNTDOWN_TICK_MS
) {
  return new Promise<void>((resolve) => {
    let remaining = seconds

    const tick = () => {
      if (remaining <= 0) {
        resolve()
        return
      }
      onTick(remaining)
      remaining -= 1
      window.setTimeout(tick, tickMs)
    }

    tick()
  })
}
