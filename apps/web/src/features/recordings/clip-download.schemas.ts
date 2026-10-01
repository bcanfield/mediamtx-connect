import { z } from 'zod'

// What <input type="time" step="1"> gives: HH:MM:SS, or HH:MM on browsers
// that drop zero seconds.
export const CLIP_START = /^(\d{2}):(\d{2})(?::(\d{2}))?$/

// The custom clip range. Minutes stop at 60 because /media/playback/get caps
// an MP4 at an hour.
export function buildClipSchema(messages: { required: string, invalidStart: string, minutesRange: string }) {
  return z.object({
    start: z.string().min(1, { message: messages.required }).regex(CLIP_START, { message: messages.invalidStart }),
    minutes: z.coerce.number({ message: messages.minutesRange })
      .int({ message: messages.minutesRange })
      .min(1, { message: messages.minutesRange })
      .max(60, { message: messages.minutesRange }),
  })
}
