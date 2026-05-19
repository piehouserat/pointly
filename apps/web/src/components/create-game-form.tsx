import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { createRoom } from "@/lib/api/rooms"
import {
  createRoomFormDefaults,
  createRoomFormSchema,
  permissionOptions,
  votingSystemOptions,
} from "@/lib/schemas/room"
import type { CreateRoomFormValues } from "@/lib/schemas/room"
import { Button } from "@pointly/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@pointly/ui/components/collapsible"
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
    description: "Allow participants throw projectiles to each other in this room.",
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

export function CreateGameForm() {
  const navigate = useNavigate()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: createRoomFormDefaults,
    validators: {
      onSubmit: createRoomFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const room = await createRoom(value)
        await navigate({
          to: "/rooms/$roomId",
          params: { roomId: room.id },
        })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to create room"
        )
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-6"
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
                <FieldLabel htmlFor={field.name}>Room&apos;s name</FieldLabel>
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
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="votingSystem">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && field.state.meta.errors.length > 0
            const selected = votingSystemOptions.find(
              (option) => option.value === field.state.value
            )

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Voting system</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (value) {
                      field.handleChange(
                        value as CreateRoomFormValues["votingSystem"]
                      )
                    }
                  }}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={isInvalid}
                    onBlur={field.handleBlur}
                  >
                    <SelectValue placeholder="Select voting system">
                      {selected?.label}
                    </SelectValue>
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
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger
          type="button"
          className="text-sm font-medium text-primary hover:underline"
        >
          {advancedOpen
            ? "Hide advanced settings..."
            : "Show advanced settings..."}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-6">
          <FieldGroup>
            <form.Field name="whoCanReveal">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                const selected = permissionOptions.find(
                  (option) => option.value === field.state.value
                )

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Who can reveal cards
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        if (value) {
                          field.handleChange(
                            value as CreateRoomFormValues["whoCanReveal"]
                          )
                        }
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full"
                        aria-invalid={isInvalid}
                        onBlur={field.handleBlur}
                      >
                        <SelectValue placeholder="Select permission">
                          {selected?.label}
                        </SelectValue>
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
                      Participants who are allowed to flip cards and show results.
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="whoCanManageIssues">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                const selected = permissionOptions.find(
                  (option) => option.value === field.state.value
                )

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Who can manage issues
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        if (value) {
                          field.handleChange(
                            value as CreateRoomFormValues["whoCanManageIssues"]
                          )
                        }
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full"
                        aria-invalid={isInvalid}
                        onBlur={field.handleBlur}
                      >
                        <SelectValue placeholder="Select permission">
                          {selected?.label}
                        </SelectValue>
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
                      Participants who are allowed to create, delete and edit issues
                      in the sidebar.
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )
              }}
            </form.Field>

            {switchFields.map((switchField) => (
              <form.Field key={switchField.name} name={switchField.name}>
                {(field) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{switchField.title}</FieldTitle>
                      <FieldDescription>
                        {switchField.description}
                      </FieldDescription>
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
            ))}
          </FieldGroup>
        </CollapsibleContent>
      </Collapsible>

      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            Create game
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
