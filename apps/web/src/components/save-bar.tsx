import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SaveBarChip {
  key: string
  error?: boolean
}

// Floating pending-changes bar shared by both config pages (boards 2d/2e).
// Render it only while the form is dirty.
export function SaveBar({
  summary,
  chips = [],
  onDiscard,
  discardLabel,
  saveLabel,
  saveDisabled = false,
}: {
  summary: string
  chips?: SaveBarChip[]
  onDiscard: () => void
  discardLabel: string
  saveLabel: string
  saveDisabled?: boolean
}) {
  return (
    <div
      data-testid="save-bar"
      className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-panel border bg-surface-raised px-4 py-3 shadow-overlay"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />
        <span className="text-[13px] text-muted-foreground">{summary}</span>
        {chips.length > 0 && (
          <span className="flex flex-wrap items-center gap-1">
            {chips.map(chip => (
              <span
                key={chip.key}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[10.5px]',
                  chip.error ? 'text-live-foreground' : 'text-muted-foreground',
                )}
              >
                {chip.key}
                {chip.error && <X aria-hidden className="size-2.5" />}
              </span>
            ))}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDiscard}>
          {discardLabel}
        </Button>
        <Button type="submit" size="sm" disabled={saveDisabled}>
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}
