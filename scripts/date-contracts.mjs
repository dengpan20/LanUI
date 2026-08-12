import assert from 'node:assert/strict'
import { compareDateValues, dateValueToDate, formatDateValue, fromDateValue, parseDateValue, resolveTimeZone, toDateValue } from '../src/date.js'

assert.equal(parseDateValue('2024-02-29','date')?.day,29,'Leap day must parse')
assert.equal(parseDateValue('2023-02-29','date'),null,'Impossible calendar days must be rejected')
assert.equal(dateValueToDate('2026-08-12T09:30',{mode:'datetime',timeZone:'Asia/Shanghai'})?.toISOString(),'2026-08-12T01:30:00.000Z','IANA wall time must map to the expected instant')
assert.equal(formatDateValue(Date.parse('2026-08-12T01:30:00.000Z'),{mode:'datetime',timeZone:'America/New_York'}),'2026-08-11T21:30','The same instant must format in another zone')
assert.equal(dateValueToDate('2026-03-08T02:30',{mode:'datetime',timeZone:'America/New_York',disambiguation:'reject'}),null,'DST gaps must be rejectable')
assert.equal(dateValueToDate('2026-11-01T01:30',{mode:'datetime',timeZone:'America/New_York',disambiguation:'earlier'})?.toISOString(),'2026-11-01T05:30:00.000Z','Earlier overlap must be deterministic')
assert.equal(dateValueToDate('2026-11-01T01:30',{mode:'datetime',timeZone:'America/New_York',disambiguation:'later'})?.toISOString(),'2026-11-01T06:30:00.000Z','Later overlap must be deterministic')
assert.equal(fromDateValue('09:30',{mode:'time',valueType:'timestamp',timeZone:'Asia/Shanghai',referenceDate:'2026-08-12'}),Date.parse('2026-08-12T01:30:00.000Z'),'Time-only conversion must use the explicit reference date')
assert.equal(toDateValue(new Date('2026-08-12T01:30:45.123Z'),{mode:'time',timeZone:'Asia/Shanghai',precision:'millisecond'}),'09:30:45.123','Precision must be preserved')
assert.equal(compareDateValues('18:00','09:30',{mode:'time'}),1,'Date values must compare structurally')
assert.equal(resolveTimeZone('UTC'),'UTC','UTC alias must normalize')

console.log('DATE_CONTRACT PASS strict=calendar zones=iana dst=gap+overlap values=string+date+timestamp precision=millisecond reference=stable')
