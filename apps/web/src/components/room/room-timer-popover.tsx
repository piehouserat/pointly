import {
  ClockPlus,
  Pause,
  Play,
  RotateCcw,
  Timer,
  TimerReset,
  Trash2,
} from "lucide-react"

import {
  clamp,
  formatTwoDigits,
  formatRemainingTime,
  parseDuration,
  splitDuration,
  useRoomTimer,
} from "@/components/room/room-timer-context"
import { TimerCountdownChart } from "@/components/room/room-timer-chart"
import { cn } from "@pointly/ui/lib/utils"
import { Button } from "@pointly/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pointly/ui/components/dropdown-menu"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@pointly/ui/components/field"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@pointly/ui/components/popover"
import { Switch } from "@pointly/ui/components/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@pointly/ui/components/tooltip"

type TimerUnitProps = {
  value: number
  label: string
  max: number
  disabled?: boolean
  onChange: (value: number) => void
}

function TimerUnit({ value, label, max, disabled, onChange }: TimerUnitProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={formatTwoDigits(value)}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10)
          onChange(Number.isNaN(next) ? 0 : clamp(next, 0, max))
        }}
        className={cn(
          "h-16 w-18 rounded-lg bg-muted text-center text-3xl font-semibold tabular-nums text-foreground shadow-xs outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-70",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function RoomTimerSetupPopover() {
  const {
    minutes,
    seconds,
    resetEachRound,
    status,
    remainingSeconds,
    setMinutes,
    setSeconds,
    setResetEachRound,
    startOrPause,
  } = useRoomTimer()

  const durationSeconds = parseDuration(minutes, seconds)
  const display = splitDuration(
    status === "idle" ? durationSeconds : remainingSeconds
  )
  const isRunning = status === "running"
  const canStart = durationSeconds > 0 || remainingSeconds > 0
  const inputsDisabled = status !== "idle" && status !== "expired"

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" />}
        title="Timer"
      >
        <Timer />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Timer</PopoverTitle>
        </PopoverHeader>

        <div className="flex items-center justify-center gap-2">
          <TimerUnit
            value={display.minutes}
            label="Minutes"
            max={99}
            disabled={inputsDisabled}
            onChange={setMinutes}
          />
          <span
            aria-hidden
            className="mb-5 text-3xl font-semibold text-muted-foreground"
          >
            :
          </span>
          <TimerUnit
            value={display.seconds}
            label="Seconds"
            max={59}
            disabled={inputsDisabled}
            onChange={setSeconds}
          />
        </div>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Time issues</FieldTitle>
            <FieldDescription>
              When enabled, the timer automatically resets after each voting
              round.
            </FieldDescription>
          </FieldContent>
          <Switch checked={resetEachRound} onCheckedChange={setResetEachRound} />
        </Field>

        <Button
          className="w-full"
          disabled={!canStart && status !== "expired"}
          onClick={startOrPause}
        >
          {isRunning ?
            <Pause data-icon="inline-start" />
          : <Play data-icon="inline-start" />}
          {isRunning ? "Pause" : status === "expired" ? "Restart" : "Start"}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function RoomTimerActiveMenu() {
  const {
    progress,
    status,
    remainingSeconds,
    resetEachRound,
    setResetEachRound,
    addMinute,
    restart,
    cancel,
  } = useRoomTimer()

  const isRunning = status === "running"
  const remainingLabel = formatRemainingTime(remainingSeconds)

  return (
    <DropdownMenu>
      <Tooltip open={isRunning ? undefined : false}>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
              aria-label={`Timer running, ${remainingLabel} remaining`}
            />
          }
        >
          <TimerCountdownChart progress={progress} />
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="border-0 bg-muted px-2.5 py-1 text-sm font-medium text-foreground tabular-nums shadow-md ring-1 ring-foreground/10 [&_[class*='Arrow']]:hidden"
        >
          {remainingLabel}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={addMinute}>
            <ClockPlus data-icon="inline-start" />
            Add 1 minute
          </DropdownMenuItem>
          <DropdownMenuItem onClick={restart}>
            <RotateCcw data-icon="inline-start" />
            Restart
          </DropdownMenuItem>
          <DropdownMenuItem onClick={cancel}>
            <Trash2 data-icon="inline-start" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <div
          className="flex items-center justify-between gap-3 rounded-sm px-2 py-1.5"
          onPointerDown={(event) => event.preventDefault()}
        >
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <TimerReset />
            <span>Time issues</span>
          </div>
          <Switch
            checked={resetEachRound}
            onCheckedChange={setResetEachRound}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RoomTimerPopover() {
  const { isActive } = useRoomTimer()

  if (isActive) {
    return <RoomTimerActiveMenu />
  }

  return <RoomTimerSetupPopover />
}
