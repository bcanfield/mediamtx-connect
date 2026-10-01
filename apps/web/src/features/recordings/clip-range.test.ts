import { describe, expect, it } from 'vitest'

import { clipFileName, clipRange } from './clip-range'

const at = (iso: string) => new Date(iso)

describe('clipRange', () => {
  const TWO_HOURS = { start: at('2026-10-01T10:00:00Z'), duration: 7200 }
  const THREE_MINUTES = { start: at('2026-10-01T15:00:00Z'), duration: 180 }

  it('ends a preset at the end of the latest span', () => {
    expect(clipRange([TWO_HOURS], 300)).toEqual({ start: at('2026-10-01T11:55:00Z'), duration: 300 })
  })

  it('clamps a preset to the start of a span shorter than it', () => {
    expect(clipRange([THREE_MINUTES], 300)).toEqual({ start: at('2026-10-01T15:00:00Z'), duration: 180 })
  })

  it('uses the latest span when there are several', () => {
    expect(clipRange([TWO_HOURS, THREE_MINUTES], 900)).toEqual({ start: at('2026-10-01T15:00:00Z'), duration: 180 })
  })

  it('takes a full hour out of a longer span', () => {
    expect(clipRange([TWO_HOURS], 3600)).toEqual({ start: at('2026-10-01T11:00:00Z'), duration: 3600 })
  })
})

describe('clipFileName', () => {
  it('names the clip after the path and its start in UTC', () => {
    expect(clipFileName('cams/front_door', at('2026-10-01T14:02:11Z'))).toBe('cams_front_door_2026-10-01_14-02-11.mp4')
  })

  it('replaces every character a file name can\'t safely hold', () => {
    expect(clipFileName('a b:c\\d*é.v-1', at('2026-10-01T00:00:00.750Z'))).toBe('a_b_c_d__.v-1_2026-10-01_00-00-00.mp4')
  })
})
