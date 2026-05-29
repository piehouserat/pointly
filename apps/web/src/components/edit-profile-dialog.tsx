import { useEffect, useState } from "react"
import { z } from "zod"

import { updateUserName } from "@/lib/update-user-name"
import { Button } from "@pointly/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pointly/ui/components/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@pointly/ui/components/field"
import { Input } from "@pointly/ui/components/input"
import { Spinner } from "@pointly/ui/components/spinner"

const nameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

type EditProfileDialogProps = {
  open: boolean
  initialName: string
  onOpenChange: (open: boolean) => void
  onSaved?: (name: string) => void | Promise<void>
}

export function EditProfileDialog({
  open,
  initialName,
  onOpenChange,
  onSaved,
}: EditProfileDialogProps) {
  const [name, setName] = useState(initialName)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initialName)
      setFieldError(null)
      setSubmitError(null)
    }
  }, [initialName, open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFieldError(null)
      setSubmitError(null)
      setIsSubmitting(false)
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldError(null)
    setSubmitError(null)

    const parsed = nameSchema.safeParse({ name: name.trim() })
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Invalid name")
      return
    }

    setIsSubmitting(true)
    try {
      await updateUserName(parsed.data.name)
      await onSaved?.(parsed.data.name)
      handleOpenChange(false)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update profile"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update the name shown on your account.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={(e) => void handleSubmit(e)}>
          <FieldGroup>
            <Field data-invalid={fieldError != null}>
              <FieldLabel htmlFor="profile-name">Your name</FieldLabel>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
                aria-invalid={fieldError != null}
              />
              {fieldError ?
                <FieldError errors={[{ message: fieldError }]} />
              : null}
            </Field>
          </FieldGroup>

          {submitError ?
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
