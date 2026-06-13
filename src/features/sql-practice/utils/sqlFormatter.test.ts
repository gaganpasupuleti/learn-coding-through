import { describe, expect, it } from 'vitest'
import { formatSqlQuery } from './sqlFormatter'

describe('formatSqlQuery', () => {
  it('uppercases basic keywords and splits major clauses', () => {
    const result = formatSqlQuery('select * from students limit 10;')
    expect(result).toContain('SELECT *')
    expect(result).toContain('FROM students')
    expect(result).toContain('LIMIT 10;')
  })

  it('preserves table and column names', () => {
    const result = formatSqlQuery('select student_name, city from students;')
    expect(result).toContain('student_name')
    expect(result).toContain('city')
    expect(result).toContain('students')
  })

  it('preserves string literals', () => {
    const result = formatSqlQuery("select * from students where city='Hyderabad';")
    expect(result).toContain("WHERE city = 'Hyderabad'")
    expect(result).not.toContain("'HYDERABAD'")
  })

  it('keeps multi-character comparison operators intact', () => {
    const cases = [
      'select * from billing where amount >= 100',
      'select * from billing where amount <= 100',
      "select * from billing where status <> 'cancelled'",
      "select * from billing where status != 'cancelled'",
    ]

    for (const input of cases) {
      const result = formatSqlQuery(input)
      expect(result).not.toMatch(/>\s=/)
      expect(result).not.toMatch(/<\s=/)
      expect(result).not.toMatch(/<\s>/)
      expect(result).not.toMatch(/!\s=/)
    }

    expect(formatSqlQuery('select * from billing where amount >= 100')).toContain('amount >= 100')
    expect(formatSqlQuery('select * from billing where amount <= 100')).toContain('amount <= 100')
    expect(formatSqlQuery("select * from billing where status <> 'cancelled'")).toContain("status <> 'cancelled'")
    expect(formatSqlQuery("select * from billing where status != 'cancelled'")).toContain("status != 'cancelled'")
  })

  it('formats JOIN queries', () => {
    const result = formatSqlQuery(
      'select * from appointments join patients on appointments.patient_id=patients.patient_id limit 10;',
    )
    expect(result).toContain('SELECT *')
    expect(result).toContain('FROM appointments')
    expect(result).toContain('JOIN patients')
    expect(result).toContain('ON appointments.patient_id = patients.patient_id')
    expect(result).toContain('LIMIT 10;')
  })

  it('formats GROUP BY, HAVING, and ORDER BY', () => {
    const result = formatSqlQuery(
      'select city,count(*) as total from students group by city having count(*)>1 order by total desc;',
    )
    expect(result).toContain('GROUP BY city')
    expect(result).toContain('HAVING COUNT(*) > 1')
    expect(result).toContain('ORDER BY total DESC')
  })

  it('returns empty SQL safely', () => {
    expect(formatSqlQuery('')).toBe('')
    expect(formatSqlQuery('   ')).toBe('   ')
  })

  it('does not throw on odd SQL', () => {
    expect(() => formatSqlQuery('@@@ ### ???')).not.toThrow()
    expect(formatSqlQuery('@@@ ### ???')).toBeTruthy()
  })
})
