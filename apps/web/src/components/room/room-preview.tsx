import { Link } from "@tanstack/react-router"

import type { RoomWithRelations } from "@/lib/api/rooms"

type RoomPreviewProps = {
  room: RoomWithRelations
}

/** Static room chrome shown blurred behind the join dialog. */
export function RoomPreview({ room }: RoomPreviewProps) {
  return (
    <div className="flex min-h-svh flex-col" aria-hidden>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
        <Link to="/" className="shrink-0" tabIndex={-1}>
          <img
            src="/pointly-logo-primary.svg"
            alt=""
            className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
          />
        </Link>
        <span className="truncate font-semibold">{room.name}</span>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-primary/25 bg-primary/5 px-6 py-16 ring-4 ring-primary/10">
          <p className="text-lg font-medium text-primary">Pick your cards!</p>
        </div>
      </div>
    </div>
  )
}
