import { describe, expect, it } from 'vitest'
import type { SqlDatabaseMeta, SqlPracticeQuestion, SqlSchemaRelationship } from '../types/sqlPractice.types'
import {
  appendSnippet,
  buildCountTemplate,
  buildGroupByTemplate,
  buildHavingTemplate,
  buildJoinTemplate,
  buildOrderLimitTemplate,
  buildSelectTemplate,
  buildWhereTemplate,
  getDefaultColumnName,
  getDefaultJoinPair,
  getDefaultTableName,
  insertSnippetAtCursor,
} from './sqlEditorInsert'

const studentsTable = {
  name: 'students',
  rowCount: 15,
  columns: [
    { name: 'student_id', dataType: 'INTEGER', isPrimaryKey: true },
    { name: 'student_name', dataType: 'TEXT' },
    { name: 'city', dataType: 'TEXT' },
  ],
}

const mockDatabase: SqlDatabaseMeta = {
  id: 'university_system',
  displayName: 'University System',
  description: 'Test database',
  tables: [
    studentsTable,
    {
      name: 'appointments',
      rowCount: 10,
      columns: [
        { name: 'appointment_id', dataType: 'INT', isPrimaryKey: true },
        {
          name: 'patient_id',
          dataType: 'INT',
          isForeignKey: true,
          references: { table: 'patients', column: 'patient_id' },
        },
      ],
    },
    {
      name: 'patients',
      rowCount: 5,
      columns: [{ name: 'patient_id', dataType: 'INT', isPrimaryKey: true }],
    },
  ],
  viewNames: [],
  storedProcedureNames: [],
}

const joinRelationship: SqlSchemaRelationship = {
  id: 'appointments.patient_id->patients.patient_id',
  fromTable: 'appointments',
  fromColumn: 'patient_id',
  toTable: 'patients',
  toColumn: 'patient_id',
}

const mockQuestion: SqlPracticeQuestion = {
  id: 'test-q1',
  title: 'Students query',
  databaseId: 'university_system',
  difficulty: 'easy',
  topic: 'select',
  problemStatement: 'List students',
  learningObjective: 'SELECT basics',
  expectedColumns: ['student_name'],
  hints: [],
  starterSql: 'SELECT student_name FROM students;',
  solutionSql: 'SELECT student_name FROM students;',
  validationMode: 'default',
}

describe('sqlEditorInsert builders', () => {
  it('buildSelectTemplate', () => {
    expect(buildSelectTemplate('students')).toBe(
      'SELECT *\nFROM students\nLIMIT 10;',
    )
  })

  it('buildJoinTemplate', () => {
    expect(buildJoinTemplate(joinRelationship)).toBe(
      'SELECT *\nFROM appointments\nJOIN patients\nON appointments.patient_id = patients.patient_id\nLIMIT 10;',
    )
  })

  it('buildCountTemplate', () => {
    expect(buildCountTemplate('students')).toBe(
      'SELECT COUNT(*) AS total_count\nFROM students;',
    )
  })

  it('buildGroupByTemplate', () => {
    expect(buildGroupByTemplate('students', 'city')).toBe(
      'SELECT city, COUNT(*) AS total_count\nFROM students\nGROUP BY city\nORDER BY total_count DESC;',
    )
  })

  it('buildWhereTemplate', () => {
    expect(buildWhereTemplate('students', 'city')).toBe(
      "SELECT *\nFROM students\nWHERE city = 'value'\nLIMIT 10;",
    )
  })

  it('buildHavingTemplate', () => {
    expect(buildHavingTemplate('students', 'city')).toBe(
      'SELECT city, COUNT(*) AS total_count\nFROM students\nGROUP BY city\nHAVING COUNT(*) > 1\nORDER BY total_count DESC;',
    )
  })

  it('buildOrderLimitTemplate', () => {
    expect(buildOrderLimitTemplate('students', 'student_name')).toBe(
      'SELECT *\nFROM students\nORDER BY student_name\nLIMIT 10;',
    )
  })
})

describe('sqlEditorInsert cursor helpers', () => {
  it('insertSnippetAtCursor at end', () => {
    const result = insertSnippetAtCursor('SELECT 1;', 'LIMIT 10;', 10)
    expect(result.text).toContain('SELECT 1;')
    expect(result.text).toContain('LIMIT 10;')
    expect(result.cursorOffset).toBeGreaterThan(0)
  })

  it('insertSnippetAtCursor in middle', () => {
    const result = insertSnippetAtCursor('SELECT ; FROM students', 'student_name', 7)
    expect(result.text).toContain('student_name')
    expect(result.cursorOffset).toBeGreaterThan(7)
  })

  it('appendSnippet with empty SQL', () => {
    expect(appendSnippet('', 'SELECT 1;')).toEqual({
      text: 'SELECT 1;',
      cursorOffset: 9,
    })
  })

  it('appendSnippet with existing SQL', () => {
    const result = appendSnippet('SELECT 1;', 'SELECT 2;')
    expect(result.text).toBe('SELECT 1;\n\nSELECT 2;')
    expect(result.cursorOffset).toBe(result.text.length)
  })
})

describe('sqlEditorInsert defaults', () => {
  it('getDefaultTableName prefers question SQL table match', () => {
    expect(getDefaultTableName(mockDatabase, mockQuestion)).toBe('students')
  })

  it('getDefaultTableName falls back to first table', () => {
    expect(getDefaultTableName(mockDatabase)).toBe('students')
  })

  it('getDefaultColumnName prefers first non-PK column', () => {
    expect(getDefaultColumnName(studentsTable)).toBe('student_name')
  })

  it('getDefaultJoinPair returns first FK relationship', () => {
    expect(getDefaultJoinPair(mockDatabase)).toEqual({
      fromTable: 'appointments',
      toTable: 'patients',
      fromColumn: 'patient_id',
      toColumn: 'patient_id',
    })
  })
})
