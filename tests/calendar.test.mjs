import assert from 'node:assert/strict'
import test from 'node:test'

import {
  blogFilterUrl,
  monthDays,
  publicationDay,
  shiftMonth,
  validDay,
  validMonth
} from '../src/data/calendar.ts'

test('publication day uses Shanghai midnight instead of UTC', () => {
  assert.equal(publicationDay(new Date('2026-10-05T15:59:59Z')), '2026-10-05')
  assert.equal(publicationDay(new Date('2026-10-05T16:00:00Z')), '2026-10-06')
})
test('date filters reject normalized overflow and malformed query values', () => {
  for (const value of [
    '2026-02-29',
    '2026-04-31',
    '2026-00-01',
    '2026-13-01',
    '2026-10-00',
    '<script>',
    null
  ])
    assert.equal(validDay(value), '')
  assert.equal(validDay('2024-02-29'), '2024-02-29')
  assert.equal(validMonth('2026-02'), '2026-02')
  assert.equal(validMonth('2026-2'), '')
})
test('Monday-first calendar handles leap years, six-week months and year transitions', () => {
  const feb = monthDays('2024-02')
  assert.equal(feb.length, 35)
  assert.equal(feb[3], '2024-02-01')
  assert.equal(feb.filter(Boolean).length, 29)
  assert.equal(monthDays('2026-03').length, 42)
  assert.equal(monthDays('2026-02').filter(Boolean).length, 28)
  assert.equal(shiftMonth('2026-12', 1), '2027-01')
  assert.equal(shiftMonth('2026-01', -1), '2025-12')
  assert.equal(shiftMonth('9999-12', 1), '')
})
test('combined filters encode tags and omit cleared dates', () => {
  const url = new URL(
    blogFilterUrl({ date: '2026-10-06', month: '2026-09', tag: '随笔 & 学习' }),
    'https://example.test'
  )
  assert.equal(url.searchParams.get('tag'), '随笔 & 学习')
  assert.equal(url.searchParams.get('date'), '2026-10-06')
  assert.equal(blogFilterUrl({ date: '', tag: '' }), '/blog')
})
