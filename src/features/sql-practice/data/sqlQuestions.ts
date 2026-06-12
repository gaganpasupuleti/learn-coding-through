import type { SqlPracticeQuestion } from '../types/sqlPractice.types'

export const SQL_STARTER_QUERY = `SELECT *
FROM students
LIMIT 10;
`

export const SQL_PRACTICE_QUESTIONS: SqlPracticeQuestion[] = [
  {
    id: 'uni-q1-student-names',
    title: 'List student names',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement:
      'Write a query that returns each student\'s name and city from the students table.',
    learningObjective: 'Practice basic SELECT and column lists.',
    expectedColumns: ['student_name', 'city'],
    hints: [
      'Use SELECT to choose columns from students.',
      'Try SELECT student_name, city FROM students.',
    ],
    starterSql: SQL_STARTER_QUERY,
  },
  {
    id: 'uni-q2-enrollment-count',
    title: 'Count enrollments per course',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each course, show the course_id and how many enrollments exist. Order by enrollment count descending.',
    learningObjective: 'Use GROUP BY and COUNT for aggregation.',
    expectedColumns: ['course_id', 'enrollment_count'],
    hints: [
      'Join enrollments to courses if you need course details, or group enrollments by course_id.',
      'COUNT(*) counts rows per group.',
    ],
    starterSql: `SELECT course_id, COUNT(*) AS enrollment_count
FROM enrollments
GROUP BY course_id
ORDER BY enrollment_count DESC;`,
  },
  {
    id: 'hosp-q1-patient-appointments',
    title: 'Upcoming patient appointments',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement:
      'List appointment_id, patient_id, and scheduled_at for appointments with status scheduled.',
    learningObjective: 'Filter rows with WHERE on a status column.',
    expectedColumns: ['appointment_id', 'patient_id', 'scheduled_at'],
    hints: [
      'Query the appointments table.',
      'Add WHERE status = \'scheduled\' (or similar literal).',
    ],
    starterSql: `SELECT appointment_id, patient_id, scheduled_at
FROM appointments
WHERE status = 'scheduled';`,
  },
  {
    id: 'hosp-q2-doctor-departments',
    title: 'Doctors with department names',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      'Show each doctor\'s full name alongside their department name.',
    learningObjective: 'Join doctors to departments on department_id.',
    expectedColumns: ['full_name', 'department_name'],
    hints: [
      'JOIN doctors and departments on department_id.',
      'Select doctor full_name and department name (alias as department_name).',
    ],
    starterSql: `SELECT d.full_name, dept.name AS department_name
FROM doctors d
JOIN departments dept ON d.department_id = dept.department_id;`,
  },
  {
    id: 'ship-q1-order-totals',
    title: 'High-value orders',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement:
      'Return order_id, customer_id, and total_amount for orders where total_amount is greater than 1000.',
    learningObjective: 'Filter numeric columns with comparison operators.',
    expectedColumns: ['order_id', 'customer_id', 'total_amount'],
    hints: [
      'Query the orders table.',
      'Use WHERE total_amount > 1000.',
    ],
    starterSql: `SELECT order_id, customer_id, total_amount
FROM orders
WHERE total_amount > 1000;`,
  },
]

export function getQuestionById(id: string): SqlPracticeQuestion | undefined {
  return SQL_PRACTICE_QUESTIONS.find((q) => q.id === id)
}

export function getDefaultQuestionForDatabase(databaseId: SqlPracticeQuestion['databaseId']): SqlPracticeQuestion {
  return (
    SQL_PRACTICE_QUESTIONS.find((q) => q.databaseId === databaseId) ?? SQL_PRACTICE_QUESTIONS[0]
  )
}
