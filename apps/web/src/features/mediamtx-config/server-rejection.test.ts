import { describe, expect, it } from 'vitest'
import { offendingField } from './server-rejection'

// Real MediaMTX rejection strings: it names the key it disliked, which is the
// only thing that says which field the operator has to go back to.
describe('offendingField', () => {
  it('picks the key MediaMTX named', () => {
    expect(offendingField('invalid source: \'rtsp:/typo\'', ['source', 'record']))
      .toBe('source')
  })

  it('reads a quoted key out of the reason', () => {
    expect(offendingField(
      '\'runOnInit\' can\'t be used with a regular expression path',
      ['runOnInit', 'record'],
    )).toBe('runOnInit')
  })

  // `record` is a prefix of every other recording key, so a shortest-first
  // match would blame the section switch for a path the operator typed.
  it('prefers the longest key when one contains another', () => {
    expect(offendingField(
      'invalid recordPath: \'/rec\'',
      ['record', 'recordPath'],
    )).toBe('recordPath')
  })

  it('blames nothing when the reason names no key that was sent', () => {
    expect(offendingField('path already exists', ['source'])).toBeNull()
  })

  // A key that wasn't part of this save can't be what MediaMTX refused.
  it('only considers the keys the save actually sent', () => {
    expect(offendingField('invalid source: \'x\'', ['record'])).toBeNull()
  })
})
