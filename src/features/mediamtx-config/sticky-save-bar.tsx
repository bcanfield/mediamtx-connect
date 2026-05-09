'use client'

import { useFormState } from 'react-hook-form'

import { Button } from '@/components/ui/button'

export function StickySaveBar({
  onReset,
}: {
  onReset: () => void
}) {
  const { isDirty, isValid, dirtyFields } = useFormState()
  const dirtyCount = Object.keys(dirtyFields).length

  if (!isDirty)
    return null

  return (
    <div
      data-testid="sticky-save-bar"
      className="sticky bottom-0 z-20 -mx-4 mt-4 flex items-center justify-between gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur"
    >
      <span className="text-sm text-muted-foreground">
        {dirtyCount}
        {' '}
        unsaved
        {dirtyCount === 1 ? ' change' : ' changes'}
      </span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onReset}>
          Discard
        </Button>
        <Button type="submit" disabled={!isValid}>
          Save changes
        </Button>
      </div>
    </div>
  )
}
