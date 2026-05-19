import { Link, createFileRoute } from "@tanstack/react-router"

import { PokerIllustration } from "@/components/landing/poker-illustration"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@pointly/ui/components/button"
import { cn } from "@pointly/ui/lib/utils"

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [{ title: "Pointly — Planning Poker for agile teams" }],
  }),
})

const navLinkClass = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "text-muted-foreground hover:bg-muted hover:text-foreground"
)

function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background to-transparent"
      />

      <header className="relative z-10 border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 shrink-0 items-center">
            <img
              src="/pointly-logo-primary.svg"
              alt="Pointly"
              className="h-8 w-auto max-w-36 object-contain object-left sm:h-9 sm:max-w-none dark:brightness-0 dark:invert"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <a href="#features" className={navLinkClass}>
              Features
            </a>
            <a href="#pricing" className={navLinkClass}>
              Pricing
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <a
              href="#signup"
              className={cn(navLinkClass, "hidden sm:inline-flex")}
            >
              Sign up
            </a>
            <a
              href="#login"
              className={cn(navLinkClass, "hidden sm:inline-flex")}
            >
              Login
            </a>
            <Link to="/new-game" className={buttonVariants({ size: "sm" })}>
              Start new game
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Planning poker for agile teams
              </h1>
              <p className="max-w-md text-lg text-muted-foreground">
                Easy-to-use, fast estimations your whole team will enjoy.
              </p>
            </div>

            <Link
              to="/new-game"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-fit px-8 text-base"
              )}
            >
              Start new game
            </Link>
          </div>

          <PokerIllustration className="mx-auto lg:mx-0 lg:ml-auto" />
        </div>
      </main>
    </div>
  )
}
