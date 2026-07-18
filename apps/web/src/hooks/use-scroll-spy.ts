import { useEffect, useState } from 'react'

// Tracks which section anchor is currently at the top of the viewport,
// for the MediaMTX config page rail (board 2e).
export function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const elements = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0)
      return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            visible.add(entry.target.id)
          else
            visible.delete(entry.target.id)
        }
        const first = ids.find(id => visible.has(id))
        if (first)
          setActiveId(first)
      },
      { rootMargin: '-96px 0px -55% 0px' },
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}
