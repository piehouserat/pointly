import { useForm } from "@tanstack/react-form"
import { Smile } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { joinRoom, type Participant } from "@/lib/api/participants"
import { authClient } from "@/lib/auth-client"
import { setStoredParticipantId } from "@/lib/participant-storage"
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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@pointly/ui/components/field"
import { Input } from "@pointly/ui/components/input"
import { Spinner } from "@pointly/ui/components/spinner"
import { Switch } from "@pointly/ui/components/switch"

const joinSchema = z.object({
  name: z.string().min(1, "Display name is required").max(100),
  isSpectator: z.boolean(),
})

type JoinRoomDialogProps = {
  roomId: string
  open: boolean
  onJoined: (participant: Participant) => void
}

export function JoinRoomDialog({ roomId, open, onJoined }: JoinRoomDialogProps) {
  const session = authClient.useSession()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: "",
      isSpectator: false,
    },
    validators: {
      onSubmit: joinSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        if (!session.data?.user) {
          const anon = await authClient.signIn.anonymous()
          if (anon.error) {
            throw new Error(anon.error.message ?? "Anonymous sign-in failed")
          }
        }

        const participant = await joinRoom({
          roomId,
          name: value.name.trim(),
          isSpectator: value.isSpectator,
        })

        setStoredParticipantId(roomId, participant.id)
        onJoined(participant)
        await session.refetch()
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to join room"
        )
      }
    },
  })

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose your display name</DialogTitle>
          <DialogDescription className="sr-only">
            Enter a display name to join this planning poker room.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Your display name</FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        className="pr-9"
                      />
                      <Smile className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="isSpectator">
              {(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Join as spectator</FieldTitle>
                  </FieldContent>
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                    onBlur={field.handleBlur}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                Continue to game
              </Button>
            )}
          </form.Subscribe>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              disabled
            >
              Login
            </button>
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              disabled
            >
              Sign Up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
