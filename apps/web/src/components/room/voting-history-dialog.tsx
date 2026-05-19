import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pointly/ui/components/dialog"

type VotingHistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VotingHistoryDialog({ open, onOpenChange }: VotingHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voting history</DialogTitle>
          <DialogDescription>
            Past rounds will appear here once story voting is implemented.
          </DialogDescription>
        </DialogHeader>
        <p className="text-muted-foreground py-8 text-center text-sm">
          No voting history yet.
        </p>
      </DialogContent>
    </Dialog>
  )
}
