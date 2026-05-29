import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import type { Story } from "@/lib/api/stories"
import { storyDisplayId } from "@/lib/api/stories"
import { Button } from "@pointly/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pointly/ui/components/dropdown-menu"
import { Spinner } from "@pointly/ui/components/spinner"
import { cn } from "@pointly/ui/lib/utils"

type StoryCardProps = {
  story: Story
  index: number
  canManage: boolean
  isHost: boolean
  isStartingVoting?: boolean
  onEdit: (story: Story) => void
  onDelete: (story: Story) => void
  onStartVoting: (story: Story) => void
}

function statusLabel(status: Story["status"]) {
  switch (status) {
    case "voting":
      return "Voting now..."
    case "revealed":
      return "Revealed"
    case "skipped":
      return "Skipped"
    default:
      return null
  }
}

export function StoryCard({
  story,
  index,
  canManage,
  isHost,
  isStartingVoting = false,
  onEdit,
  onDelete,
  onStartVoting,
}: StoryCardProps) {
  const label = statusLabel(story.status)
  const estimate = story.finalEstimate ?? "–"

  return (
    <article className="rounded-lg border border-border bg-card p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-primary">
          {storyDisplayId(index)}
        </span>
        {canManage ?
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Actions for ${story.title}`}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onEdit(story)}>
                  <Pencil data-icon="inline-start" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(story)}
                >
                  <Trash2 data-icon="inline-start" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        : null}
      </div>

      <p className="mt-2 line-clamp-3 text-sm font-medium">{story.title}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        {story.status === "pending" && isHost ?
          <Button
            variant="secondary"
            size="sm"
            disabled={isStartingVoting}
            onClick={() => onStartVoting(story)}
          >
            {isStartingVoting ?
              <Spinner data-icon="inline-start" />
            : null}
            Vote this issue
          </Button>
        : label ?
          <span
            className={cn(
              "inline-flex rounded-md px-2.5 py-1 text-xs font-medium",
              story.status === "voting" ?
                "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
            )}
          >
            {label}
          </span>
        : null}
        <span
          className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm font-medium tabular-nums"
          aria-label={
            story.finalEstimate ?
              `Estimate ${story.finalEstimate}`
            : "No estimate"
          }
        >
          {estimate}
        </span>
      </div>
    </article>
  )
}
