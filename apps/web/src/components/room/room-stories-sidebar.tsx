import { Plus, X } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

import { StoryCard } from "@/components/room/story-card"
import type { Participant } from "@/lib/api/participants"
import { startVoting } from "@/lib/api/room-state"
import {
  canManageStories,
  createStory,
  deleteStory,
  updateStory,
} from "@/lib/api/stories"
import type { Story } from "@/lib/api/stories"
import { parseVoteNumber } from "@/lib/room/vote-stats"
import type { Room } from "@/lib/schemas/room"
import { Button } from "@pointly/ui/components/button"
import { Field, FieldLabel } from "@pointly/ui/components/field"
import { ScrollArea } from "@pointly/ui/components/scroll-area"
import { Spinner } from "@pointly/ui/components/spinner"
import { Textarea } from "@pointly/ui/components/textarea"
import { cn } from "@pointly/ui/lib/utils"

export const storiesSidebarWidth = 420

type RoomStoriesSidebarProps = {
  room: Room
  participant: Participant
  stories: Array<Story>
  isLoading?: boolean
  error?: string | null
  onClose: () => void
  onStoriesChange: () => void
}

type StoryInlineFormProps = {
  title: string
  error: string | null
  isSubmitting: boolean
  onTitleChange: (value: string) => void
  onCancel: () => void
  onSave: () => void
}

function StoryInlineForm({
  title,
  error,
  isSubmitting,
  onTitleChange,
  onCancel,
  onSave,
}: StoryInlineFormProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="story-title" className="sr-only">
          Story title
        </FieldLabel>
        <Textarea
          id="story-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Enter a title for the story"
          className="min-h-24 resize-none"
          disabled={isSubmitting}
          autoFocus
        />
      </Field>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button className="flex-1" disabled={isSubmitting} onClick={onSave}>
          {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
          Save
        </Button>
      </div>
    </>
  )
}

function storyPoints(stories: Array<Story>) {
  return stories.reduce((sum, story) => {
    if (!story.finalEstimate) return sum
    const value = parseVoteNumber(story.finalEstimate)
    return sum + (value ?? 0)
  }, 0)
}

export function RoomStoriesSidebar({
  room,
  participant,
  stories,
  isLoading = false,
  error = null,
  onClose,
  onStoriesChange,
}: RoomStoriesSidebarProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [title, setTitle] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startingStoryId, setStartingStoryId] = useState<string | null>(null)

  const canManage = canManageStories(room.whoCanManageIssues, participant)
  const isFormOpen = isAdding || editingStory != null
  const points = storyPoints(stories)

  function openAddForm() {
    setEditingStory(null)
    setTitle("")
    setFormError(null)
    setIsAdding(true)
  }

  function openEditForm(story: Story) {
    setIsAdding(false)
    setEditingStory(story)
    setTitle(story.title)
    setFormError(null)
  }

  function closeForm() {
    setIsAdding(false)
    setEditingStory(null)
    setTitle("")
    setFormError(null)
  }

  async function handleSave() {
    const trimmed = title.trim()
    if (!trimmed) {
      setFormError("Enter a title for the story")
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      if (editingStory) {
        await updateStory(room.id, editingStory.id, { title: trimmed })
      } else {
        await createStory(room.id, {
          title: trimmed,
          order: stories.length,
        })
      }
      onStoriesChange()
      closeForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save story")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(story: Story) {
    setIsSubmitting(true)
    setFormError(null)
    try {
      await deleteStory(room.id, story.id)
      onStoriesChange()
      if (editingStory?.id === story.id) {
        closeForm()
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to delete story"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStartVoting(story: Story) {
    setStartingStoryId(story.id)
    setFormError(null)
    try {
      await startVoting(room.id, { storyId: story.id })
      onStoriesChange()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to start voting"
      )
    } finally {
      setStartingStoryId(null)
    }
  }

  const storyCountLabel =
    stories.length === 1 ? "1 story" : `${stories.length} stories`
  const headerMeta =
    stories.length > 0
      ? points > 0
        ? `${storyCountLabel} • ${points} points`
        : storyCountLabel
      : null

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: storiesSidebarWidth, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex h-svh shrink-0 flex-col overflow-hidden border-l border-border bg-popover"
      aria-label="Stories"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Stories</h2>
          {headerMeta ? (
            <p className="text-xs text-muted-foreground">{headerMeta}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close stories sidebar"
          >
            <X />
          </Button>
        </div>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-6" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : (
            <>
              {stories.map((story, index) =>
                editingStory?.id === story.id ? (
                  <StoryInlineForm
                    key={story.id}
                    title={title}
                    error={formError}
                    isSubmitting={isSubmitting}
                    onTitleChange={setTitle}
                    onCancel={closeForm}
                    onSave={() => void handleSave()}
                  />
                ) : (
                  <StoryCard
                    key={story.id}
                    story={story}
                    index={index}
                    canManage={canManage}
                    isHost={participant.isHost}
                    isStartingVoting={startingStoryId === story.id}
                    onEdit={openEditForm}
                    onDelete={(s) => void handleDelete(s)}
                    onStartVoting={(s) => void handleStartVoting(s)}
                  />
                )
              )}
              {isAdding ? (
                <StoryInlineForm
                  title={title}
                  error={formError}
                  isSubmitting={isSubmitting}
                  onTitleChange={setTitle}
                  onCancel={closeForm}
                  onSave={() => void handleSave()}
                />
              ) : null}
              {canManage && !isFormOpen ? (
                <button
                  type="button"
                  onClick={openAddForm}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-1 py-2 text-sm text-muted-foreground transition-colors",
                    "hover:text-foreground"
                  )}
                >
                  <Plus className="size-4" />
                  {stories.length === 0 ? "Add a story" : "Add another story"}
                </button>
              ) : null}
              {!canManage && stories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stories yet.</p>
              ) : null}
            </>
          )}
        </div>
      </ScrollArea>
    </motion.aside>
  )
}
