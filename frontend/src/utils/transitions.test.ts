import { describe, expect, it } from 'vitest'
import { canTransition, getAllowedTargets } from './transitions'

describe('getAllowedTargets', () => {
  it.each([
    ['WISHLIST', ['APPLIED', 'REJECTED']],
    ['APPLIED', ['INTERVIEW', 'REJECTED']],
    ['INTERVIEW', ['OFFER', 'REJECTED']],
    ['OFFER', ['REJECTED']],
    ['REJECTED', ['APPLIED']],
  ] as const)('from %s allows %j', (from, expected) => {
    expect(getAllowedTargets(from)).toEqual(expected)
  })
})

describe('canTransition', () => {
  it('accepts allowed moves', () => {
    expect(canTransition('WISHLIST', 'APPLIED')).toBe(true)
    expect(canTransition('REJECTED', 'APPLIED')).toBe(true)
  })

  it('rejects skipping steps, going back or staying in place', () => {
    expect(canTransition('APPLIED', 'OFFER')).toBe(false)
    expect(canTransition('INTERVIEW', 'APPLIED')).toBe(false)
    expect(canTransition('OFFER', 'OFFER')).toBe(false)
  })
})
