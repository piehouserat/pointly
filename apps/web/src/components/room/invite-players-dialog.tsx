import { useEffect, useRef, useState } from "react"

import { copyRoomInviteLink, getRoomInviteUrl } from "@/lib/room/utils"
import { Button } from "@pointly/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pointly/ui/components/dialog"
import { Field, FieldLabel } from "@pointly/ui/components/field"
import { Input } from "@pointly/ui/components/input"
import { Spinner } from "@pointly/ui/components/spinner"

type InvitePlayersDialogProps = {
  roomId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvitePlayersDialog({
  roomId,
  open,
  onOpenChange,
}: InvitePlayersDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inviteUrl, setInviteUrl] = useState("")
  const [isCopying, setIsCopying] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setInviteUrl(getRoomInviteUrl(roomId))
      setCopied(false)
    }
  }, [open, roomId])

  useEffect(() => {
    if (open && inviteUrl) {
      const frame = window.requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [open, inviteUrl])

  async function handleCopy() {
    setIsCopying(true)
    try {
      await copyRoomInviteLink(roomId)
      setCopied(true)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite players</DialogTitle>
          <DialogDescription className="sr-only">
            Share this link so others can join the room.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="room-invite-url">Game&apos;s url</FieldLabel>
          <Input
            ref={inputRef}
            id="room-invite-url"
            readOnly
            value={inviteUrl}
            onFocus={(event) => event.target.select()}
            className="font-mono text-sm"
          />
        </Field>

        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void handleCopy()}
          disabled={!inviteUrl || isCopying}
        >
          {isCopying ? <Spinner data-icon="inline-start" /> : null}
          {copied ? "Copied!" : "Copy invitation link"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
