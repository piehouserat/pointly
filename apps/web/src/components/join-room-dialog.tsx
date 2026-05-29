import { useForm } from "@tanstack/react-form"
import { Smile } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { useAuthDialog } from "@/components/auth/auth-dialog-provider"
import { joinRoom } from "@/lib/api/participants"
import type { Participant } from "@/lib/api/participants"
import { authClient } from "@/lib/auth-client"
import { authCallbackUrl } from "@/lib/auth-callback-url"
import { updateUserName } from "@/lib/update-user-name"
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

const profileNameSchema = z.object({
  name: z.string().min(1, "Display name is required").max(100),
  isSpectator: z.boolean(),
})

export type JoinRoomDialogMode = "join" | "setup-profile"

type JoinRoomDialogProps = {
  roomId: string
  open: boolean
  mode: JoinRoomDialogMode
  onJoined: (participant: Participant) => void
}

export function JoinRoomDialog({
  roomId,
  open,
  mode,
  onJoined,
}: JoinRoomDialogProps) {
  const session = authClient.useSession()
  const { openLogin, openSignup } = useAuthDialog()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const roomCallbackUrl = authCallbackUrl(`/rooms/${roomId}`)
  const isSetupProfile = mode === "setup-profile"

  const form = useForm({
    defaultValues: {
      name: "",
      isSpectator: false,
    },
    validators: {
      onSubmit: isSetupProfile ? profileNameSchema : joinSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const trimmedName = value.name.trim()

        if (isSetupProfile) {
          await updateUserName(trimmedName)
          await session.refetch()
        } else if (!session.data?.user) {
          const anon = await authClient.signIn.anonymous()
          if (anon.error) {
            throw new Error(anon.error.message ?? "Anonymous sign-in failed")
          }
        }

        const participant = await joinRoom({
          roomId,
          name: trimmedName,
          isSpectator: value.isSpectator,
        })

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
          <DialogTitle>
            {isSetupProfile ? "Set your display name" : "Choose your display name"}
          </DialogTitle>
          <DialogDescription>
            {isSetupProfile ?
              "This name is saved to your account and used when you join rooms."
            : "Enter a display name to join this planning poker room."}
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
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Your display name
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid}
                        autoComplete="name"
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

          {submitError ?
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          : null}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                Continue to game
              </Button>
            )}
          </form.Subscribe>

          {!isSetupProfile ?
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => openLogin({ callbackURL: roomCallbackUrl })}
              >
                Login
              </button>
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => openSignup({ callbackURL: roomCallbackUrl })}
              >
                Sign Up
              </button>
            </div>
          : null}
        </form>
      </DialogContent>
    </Dialog>
  )
}
