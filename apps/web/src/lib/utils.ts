import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge only knows Tailwind's own scales. The Geist type ramp
// (`--text-*` / `--tracking-*` in globals.css) is ours, so without this it
// reads `text-control` as a colour and stops deduping it against `text-sm`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-section',
        'text-body',
        'text-control',
        'text-row',
        'text-lead',
        'text-meta',
        'text-status',
        'text-label',
        'text-micro',
      ],
      'tracking': ['tracking-title'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
