import type { SqlDatabaseId, SqlPracticeQuestion } from '../types/sqlPractice.types'

export const SQL_STARTER_QUERY = `SELECT *
FROM students
LIMIT 10;
`

const UNIVERSITY_QUESTIONS: SqlPracticeQuestion[] = [
  {
    id: 'uni-q1-student-names',
    title: 'List student names',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: "Write a query that returns each student's name and city from the students table.",
    learningObjective: 'Practice basic SELECT and column lists.',
    expectedColumns: ['student_name', 'city'],
    hints: ['Use SELECT to choose columns from students.', 'Try SELECT student_name, city FROM students.'],
    starterSql: SQL_STARTER_QUERY,
    solutionSql: `SELECT student_name, city
FROM students;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q2-hyderabad-students',
    title: 'Students in Hyderabad',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement: "Return student_name and city for students who live in 'Hyderabad'.",
    learningObjective: 'Filter rows with WHERE.',
    expectedColumns: ['student_name', 'city'],
    hints: ["Use WHERE city = 'Hyderabad'.", 'Select student_name and city.'],
    starterSql: `SELECT student_name, city
FROM students
WHERE city = 'Hyderabad';`,
    solutionSql: `SELECT student_name, city
FROM students
WHERE city = 'Hyderabad';`,
    validationMode: 'default',
  },
  {
    id: 'uni-q3-order-students',
    title: 'Students ordered by name',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'List student_name and city ordered alphabetically by student_name.',
    learningObjective: 'Use ORDER BY for sorted results.',
    expectedColumns: ['student_name', 'city'],
    hints: ['Add ORDER BY student_name.', 'Ascending order is the default.'],
    starterSql: `SELECT student_name, city
FROM students
ORDER BY student_name;`,
    solutionSql: `SELECT student_name, city
FROM students
ORDER BY student_name;`,
    validationMode: 'ordered',
  },
  {
    id: 'uni-q4-limit-five',
    title: 'First five students',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'Return the first 5 students by student_id (student_name only).',
    learningObjective: 'Limit result size with LIMIT.',
    expectedColumns: ['student_name'],
    hints: ['ORDER BY student_id then LIMIT 5.', 'SELECT only student_name.'],
    starterSql: `SELECT student_name
FROM students
ORDER BY student_id
LIMIT 5;`,
    solutionSql: `SELECT student_name
FROM students
ORDER BY student_id
LIMIT 5;`,
    validationMode: 'ordered',
  },
  {
    id: 'uni-q5-count-students',
    title: 'Count all students',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'aggregates',
    problemStatement: 'Return the total number of students as total_students.',
    learningObjective: 'Use COUNT for aggregation.',
    expectedColumns: ['total_students'],
    hints: ['COUNT(*) counts rows.', 'Alias the count column as total_students.'],
    starterSql: `SELECT COUNT(*) AS total_students
FROM students;`,
    solutionSql: `SELECT COUNT(*) AS total_students
FROM students;`,
    validationMode: 'aggregate',
  },
  {
    id: 'uni-q6-enrollment-count',
    title: 'Count enrollments per course',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each course_id, show how many enrollments exist. Order by enrollment count descending.',
    learningObjective: 'Use GROUP BY and COUNT.',
    expectedColumns: ['course_id', 'enrollment_count'],
    hints: ['GROUP BY course_id.', 'Use COUNT(*) AS enrollment_count.'],
    starterSql: `SELECT course_id, COUNT(*) AS enrollment_count
FROM enrollments
GROUP BY course_id
ORDER BY enrollment_count DESC;`,
    solutionSql: `SELECT course_id, COUNT(*) AS enrollment_count
FROM enrollments
GROUP BY course_id
ORDER BY enrollment_count DESC;`,
    validationMode: 'ordered',
  },
  {
    id: 'uni-q7-having-courses',
    title: 'Courses with multiple enrollments',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'Show course_id values that have more than one enrollment. Include enrollment_count.',
    learningObjective: 'Filter grouped rows with HAVING.',
    expectedColumns: ['course_id', 'enrollment_count'],
    hints: ['GROUP BY course_id.', 'HAVING COUNT(*) > 1.'],
    starterSql: `SELECT course_id, COUNT(*) AS enrollment_count
FROM enrollments
GROUP BY course_id
HAVING COUNT(*) > 1;`,
    solutionSql: `SELECT course_id, COUNT(*) AS enrollment_count
FROM enrollments
GROUP BY course_id
HAVING COUNT(*) > 1;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q8-inner-join-courses',
    title: 'Student course names',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      'Show each student_name with the course_name they enrolled in (via enrollments and courses).',
    learningObjective: 'Join students, enrollments, and courses.',
    expectedColumns: ['student_name', 'course_name'],
    hints: [
      'JOIN enrollments on student_id, then courses on course_id.',
      'Select student_name and course_name.',
    ],
    starterSql: `SELECT s.student_name, c.course_name
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id;`,
    solutionSql: `SELECT s.student_name, c.course_name
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q9-left-join-programs',
    title: 'All students with program names',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      'List every student_name and their program_name. Use a LEFT JOIN so all students appear.',
    learningObjective: 'Use LEFT JOIN to keep all rows from the left table.',
    expectedColumns: ['student_name', 'program_name'],
    hints: ['LEFT JOIN programs on program_id.', 'Start FROM students.'],
    starterSql: `SELECT s.student_name, p.program_name
FROM students s
LEFT JOIN programs p ON s.program_id = p.program_id;`,
    solutionSql: `SELECT s.student_name, p.program_name
FROM students s
LEFT JOIN programs p ON s.program_id = p.program_id;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q10-avg-grade',
    title: 'Average grade per course',
    databaseId: 'university_system',
    difficulty: 'hard',
    topic: 'aggregates',
    problemStatement:
      'For each course_id, calculate the average numeric_grade as avg_grade from grades joined through enrollments.',
    learningObjective: 'Combine JOINs with AVG and GROUP BY.',
    expectedColumns: ['course_id', 'avg_grade'],
    hints: [
      'JOIN grades → enrollments → courses.',
      'Use AVG(numeric_grade) and GROUP BY course_id.',
    ],
    starterSql: `SELECT e.course_id, AVG(g.numeric_grade) AS avg_grade
FROM grades g
JOIN enrollments e ON g.enrollment_id = e.enrollment_id
GROUP BY e.course_id;`,
    solutionSql: `SELECT e.course_id, ROUND(AVG(g.numeric_grade), 2) AS avg_grade
FROM grades g
JOIN enrollments e ON g.enrollment_id = e.enrollment_id
GROUP BY e.course_id;`,
    validationMode: 'aggregate',
    validation: { numericTolerance: 0.05 },
  },
  {
    id: 'uni-q11-subquery-hyderabad',
    title: 'Hyderabad students with enrollments',
    databaseId: 'university_system',
    difficulty: 'hard',
    topic: 'subqueries',
    problemStatement:
      'List student_name for students in Hyderabad who have at least one enrollment (use a subquery or JOIN).',
    learningObjective: 'Combine filtering with enrollment checks.',
    expectedColumns: ['student_name'],
    hints: [
      'Filter city = Hyderabad.',
      'Ensure the student appears in enrollments.',
    ],
    starterSql: `SELECT DISTINCT s.student_name
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
WHERE s.city = 'Hyderabad';`,
    solutionSql: `SELECT DISTINCT s.student_name
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
WHERE s.city = 'Hyderabad';`,
    validationMode: 'default',
  },
  {
    id: 'uni-q12-distinct-cities',
    title: 'Distinct student cities',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'Return a distinct list of city values from students, ordered by city.',
    learningObjective: 'Use SELECT DISTINCT and ORDER BY.',
    expectedColumns: ['city'],
    hints: ['SELECT DISTINCT city FROM students.', 'Add ORDER BY city.'],
    starterSql: `SELECT DISTINCT city
FROM students
ORDER BY city;`,
    solutionSql: `SELECT DISTINCT city
FROM students
ORDER BY city;`,
    validationMode: 'ordered',
  },
]

const NON_UNIVERSITY_QUESTIONS: SqlPracticeQuestion[] = [
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
    hints: ['Query the appointments table.', "Add WHERE status = 'scheduled'."],
    starterSql: `SELECT appointment_id, patient_id, scheduled_at
FROM appointments
WHERE status = 'scheduled';`,
    solutionSql: '',
    validationMode: 'default',
  },
  {
    id: 'hosp-q2-doctor-departments',
    title: 'Doctors with department names',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement: "Show each doctor's full name alongside their department name.",
    learningObjective: 'Join doctors to departments on department_id.',
    expectedColumns: ['full_name', 'department_name'],
    hints: ['JOIN doctors and departments on department_id.'],
    starterSql: `SELECT d.full_name, dept.name AS department_name
FROM doctors d
JOIN departments dept ON d.department_id = dept.department_id;`,
    solutionSql: '',
    validationMode: 'default',
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
    hints: ['Query the orders table.', 'Use WHERE total_amount > 1000.'],
    starterSql: `SELECT order_id, customer_id, total_amount
FROM orders
WHERE total_amount > 1000;`,
    solutionSql: '',
    validationMode: 'default',
  },
]

export const SQL_PRACTICE_QUESTIONS: SqlPracticeQuestion[] = [
  ...UNIVERSITY_QUESTIONS,
  ...NON_UNIVERSITY_QUESTIONS,
]

export function getQuestionById(id: string): SqlPracticeQuestion | undefined {
  return SQL_PRACTICE_QUESTIONS.find((q) => q.id === id)
}

export function getQuestionsForDatabase(databaseId: SqlDatabaseId): SqlPracticeQuestion[] {
  return SQL_PRACTICE_QUESTIONS.filter((q) => q.databaseId === databaseId)
}

export function getUniversityQuestions(): SqlPracticeQuestion[] {
  return UNIVERSITY_QUESTIONS
}

export function getDefaultQuestionForDatabase(databaseId: SqlPracticeQuestion['databaseId']): SqlPracticeQuestion {
  return getQuestionsForDatabase(databaseId)[0] ?? SQL_PRACTICE_QUESTIONS[0]
}

export function isUniversityCheckableQuestion(question: SqlPracticeQuestion): boolean {
  return question.databaseId === 'university_system' && Boolean(question.solutionSql)
}
