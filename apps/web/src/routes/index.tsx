import { Link, createFileRoute } from "@tanstack/react-router"

import { LandingHeader } from "@/components/landing/landing-header"
import { PokerIllustration } from "@/components/landing/poker-illustration"
import { buttonVariants } from "@pointly/ui/components/button"
import { cn } from "@pointly/ui/lib/utils"

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [{ title: "Pointly — Planning Poker for agile teams" }],
  }),
})

function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background to-transparent"
      />

      <LandingHeader />

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
