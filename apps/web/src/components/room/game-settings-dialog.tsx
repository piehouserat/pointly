import { useForm } from "@tanstack/react-form"
import { useState } from "react"

import { updateRoom } from "@/lib/api/rooms"
import type { RoomWithRelations } from "@/lib/api/rooms"
import type { Participant } from "@/lib/api/participants"
import {
  createRoomFormSchema,
  permissionOptions,
  votingSystemOptions,
} from "@/lib/schemas/room"
import type { CreateRoomFormValues } from "@/lib/schemas/room"
import { Button } from "@pointly/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pointly/ui/components/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@pointly/ui/components/field"
import { Input } from "@pointly/ui/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pointly/ui/components/select"
import { Spinner } from "@pointly/ui/components/spinner"
import { Switch } from "@pointly/ui/components/switch"

const switchFields = [
  {
    name: "autoReveal" as const,
    title: "Auto-reveal cards",
    description: "Show cards automatically after everyone voted.",
  },
  {
    name: "funFeatures" as const,
    title: "Enable fun features",
    description:
      "Allow participants throw projectiles to each other in this room.",
  },
  {
    name: "showAverage" as const,
    title: "Show average in the results",
    description: "Include the average value in the results of the voting.",
  },
  {
    name: "showCountdown" as const,
    title: "Show countdown animation",
    description:
      "A countdown is shown when revealing cards to ensure last-second votes are recorded.",
  },
] satisfies Array<{
  name: keyof Pick<
    CreateRoomFormValues,
    "autoReveal" | "funFeatures" | "showAverage" | "showCountdown"
  >
  title: string
  description: string
}>

type GameSettingsDialogProps = {
  room: RoomWithRelations
  participant: Participant
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (room: RoomWithRelations) => void
}

function roomToFormValues(room: RoomWithRelations): CreateRoomFormValues {
  return {
    name: room.name,
    votingSystem: room.votingSystem,
    whoCanReveal: room.whoCanReveal,
    whoCanManageIssues: room.whoCanManageIssues,
    autoReveal: room.autoReveal,
    funFeatures: room.funFeatures,
    showAverage: room.showAverage,
    showCountdown: room.showCountdown,
  }
}

export function GameSettingsDialog({
  room,
  participant,
  open,
  onOpenChange,
  onSaved,
}: GameSettingsDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const canEdit = participant.isHost
  const host = room.participants.find((p) => p.isHost)

  const form = useForm({
    defaultValues: roomToFormValues(room),
    validators: {
      onSubmit: createRoomFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!canEdit) return
      setSubmitError(null)
      try {
        const updated = await updateRoom(room.id, value)
        onSaved({
          ...room,
          ...updated,
          participants: room.participants,
          stories: room.stories,
        })
        onOpenChange(false)
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to save settings"
        )
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Game settings</DialogTitle>
          <DialogDescription className="sr-only">
            Configure voting rules and room options.
          </DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar max-h-[80vh] overflow-y-auto">
          <form
            className="flex flex-col gap-6 py-5"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            {!canEdit ? (
              <p className="text-sm text-muted-foreground">
                Only the host can change game settings.
              </p>
            ) : null}

            <FieldGroup>
              <Field>
                <FieldLabel>Game facilitator</FieldLabel>
                <Input
                  value={
                    host
                      ? `${host.name}${participant.isHost ? " (You)" : ""}`
                      : "—"
                  }
                  disabled
                  readOnly
                />
              </Field>

              <form.Field name="name">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Game&apos;s name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                        disabled={!canEdit}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="votingSystem">
                {(field) => (
                  <Field>
                    <FieldLabel>Voting system</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as CreateRoomFormValues["votingSystem"]
                        )
                      }
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {votingSystemOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              <form.Field name="whoCanReveal">
                {(field) => (
                  <Field>
                    <FieldLabel>Who can reveal cards</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as CreateRoomFormValues["whoCanReveal"]
                        )
                      }
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {permissionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Participants who are allowed to flip cards and show
                      results.
                    </FieldDescription>
                  </Field>
                )}
              </form.Field>

              <form.Field name="whoCanManageIssues">
                {(field) => (
                  <Field>
                    <FieldLabel>Who can manage issues</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as CreateRoomFormValues["whoCanManageIssues"]
                        )
                      }
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {permissionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Participants who are allowed to create, delete and edit
                      issues in the sidebar.
                    </FieldDescription>
                  </Field>
                )}
              </form.Field>

              {switchFields.map((item) => (
                <form.Field key={item.name} name={item.name}>
                  {(field) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{item.title}</FieldTitle>
                        <FieldDescription>{item.description}</FieldDescription>
                      </FieldContent>
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                        disabled={!canEdit}
                      />
                    </Field>
                  )}
                </form.Field>
              ))}
            </FieldGroup>

            {submitError ? (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}

            {canEdit ? (
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" className="w-full">
                    {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                    Save settings
                  </Button>
                )}
              </form.Subscribe>
            ) : null}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
