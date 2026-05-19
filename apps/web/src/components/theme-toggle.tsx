import { useTheme } from "@lonik/themer"
import { useHydrated } from "@tanstack/react-router"
import { Moon, Sun, SunMoon } from "lucide-react"

import { Button } from "@pointly/ui/components/button"
import { cn } from "@pointly/ui/lib/utils"

const themeOrder = ["system", "light", "dark"] as const
type ThemeValue = (typeof themeOrder)[number]

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const currentTheme: ThemeValue = (theme as ThemeValue) ?? "system"
  const hydrated = useHydrated()

  const nextTheme = (value: ThemeValue): ThemeValue => {
    const index = themeOrder.indexOf(value)
    return themeOrder[(index + 1) % themeOrder.length]!
  }

  const icon =
    currentTheme === "light" ? (
      <Sun />
    ) : currentTheme === "dark" ? (
      <Moon />
    ) : (
      <SunMoon />
    )

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(className)}
      suppressHydrationWarning
      aria-label={`Theme: ${currentTheme}. Click to switch theme`}
      title={`Theme: ${currentTheme}`}
      onClick={() => setTheme(nextTheme(currentTheme))}
    >
      {hydrated ? icon : null}
    </Button>
  )
}
