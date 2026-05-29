import { MailCheck } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"
import { authCallbackUrl } from "@/lib/auth-callback-url"
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@pointly/ui/components/field"
import { Input } from "@pointly/ui/components/input"
import { Spinner } from "@pointly/ui/components/spinner"

export type AuthDialogMode = "login" | "signup"

type AuthDialogProps = {
  open: boolean
  mode: AuthDialogMode
  callbackURL?: string
  onOpenChange: (open: boolean) => void
  onSwitchMode: (mode: AuthDialogMode) => void
}

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
})

const signupSchema = loginSchema.extend({
  name: z.string().min(1, "Name is required").max(100),
})

export function AuthDialog({
  open,
  mode,
  callbackURL,
  onOpenChange,
  onSwitchMode,
}: AuthDialogProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const isSignup = mode === "signup"
  const title = isSignup ? "Create your account" : "Sign in"
  const description =
    isSignup ?
      "Enter your details and we will email you a magic link to create your account."
    : "Enter your email and we will send you a magic link to sign in."

  function resetForm() {
    setEmail("")
    setName("")
    setFieldError(null)
    setSubmitError(null)
    setIsSubmitting(false)
    setEmailSent(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldError(null)
    setSubmitError(null)

    if (isSignup) {
      const parsed = signupSchema.safeParse({ email, name: name.trim() })
      if (!parsed.success) {
        setFieldError(parsed.error.issues[0]?.message ?? "Invalid input")
        return
      }

      setIsSubmitting(true)
      try {
        const callback = callbackURL ?? authCallbackUrl()
        const result = await authClient.signIn.magicLink({
          email: parsed.data.email,
          name: parsed.data.name,
          callbackURL: callback,
          newUserCallbackURL: callback,
          errorCallbackURL: `${callback}${callback.includes("?") ? "&" : "?"}authError=1`,
        })

        if (result.error) {
          throw new Error(result.error.message ?? "Failed to send magic link")
        }

        setEmailSent(true)
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to send magic link"
        )
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    const parsed = loginSchema.safeParse({ email })
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    setIsSubmitting(true)
    try {
      const callback = callbackURL ?? authCallbackUrl()
      const result = await authClient.signIn.magicLink({
        email: parsed.data.email,
        callbackURL: callback,
        newUserCallbackURL: callback,
        errorCallbackURL: `${callback}${callback.includes("?") ? "&" : "?"}authError=1`,
      })

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to send magic link")
      }

      setEmailSent(true)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to send magic link"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        {emailSent ?
          <>
            <DialogHeader>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                We sent a sign-in link to <strong>{email}</strong>. Open it on
                this device to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MailCheck className="size-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                The link expires in 5 minutes. You can close this dialog.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </>
        : <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <form className="flex flex-col gap-5" onSubmit={(e) => void handleSubmit(e)}>
              <FieldGroup>
                {isSignup ?
                  <Field data-invalid={fieldError != null && name.trim() === ""}>
                    <FieldLabel htmlFor="auth-name">Your name</FieldLabel>
                    <Input
                      id="auth-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                  </Field>
                : null}

                <Field data-invalid={fieldError != null}>
                  <FieldLabel htmlFor="auth-email">Email address</FieldLabel>
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
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

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                {isSignup ? "Create account" : "Send magic link"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isSignup ?
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => {
                        setFieldError(null)
                        setSubmitError(null)
                        onSwitchMode("login")
                      }}
                    >
                      Sign in
                    </button>
                  </>
                : <>
                    New to Pointly?{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => {
                        setFieldError(null)
                        setSubmitError(null)
                        onSwitchMode("signup")
                      }}
                    >
                      Create an account
                    </button>
                  </>
                }
              </p>
            </form>
          </>
        }
      </DialogContent>
    </Dialog>
  )
}
