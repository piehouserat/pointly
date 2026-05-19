import { Link, createFileRoute } from "@tanstack/react-router"

import { CreateGameForm } from "@/components/create-game-form"

export const Route = createFileRoute("/new-game")({
  component: NewGamePage,
  head: () => ({
    meta: [{ title: "Create game — Pointly" }],
  }),
})

function NewGamePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex items-center gap-3 px-6 py-6 sm:px-8">
        <Link to="/" className="shrink-0">
          <img
            src="/pointly-logo-primary.svg"
            alt="Pointly"
            className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
          />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Create game</h1>
      </header>

      <main className="mx-auto w-full max-w-md px-6 pb-16 sm:px-8">
        <CreateGameForm />
      </main>
    </div>
  )
}
