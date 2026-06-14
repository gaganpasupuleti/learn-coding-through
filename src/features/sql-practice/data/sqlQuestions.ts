import type { SqlDatabaseId, SqlPracticeQuestion, SqlPracticeTopic } from '../types/sqlPractice.types'
import {
  HOSPITAL_QUESTIONS_EXPANSION,
  SHIPPING_QUESTIONS_EXPANSION,
  UNIVERSITY_QUESTIONS_EXPANSION,
} from './sqlQuestionsExpansion'

export const SQL_STARTER_QUERY = `SELECT *
FROM students
LIMIT 10;
`

export const HOSPITAL_STARTER_QUERY = `SELECT *
FROM patients
LIMIT 10;
`

export const SHIPPING_STARTER_QUERY = `SELECT *
FROM orders
LIMIT 10;
`

export function getStarterQueryForDatabase(databaseId: SqlDatabaseId): string {
  if (databaseId === 'hospital_management') return HOSPITAL_STARTER_QUERY
  if (databaseId === 'shipping_logistics') return SHIPPING_STARTER_QUERY
  return SQL_STARTER_QUERY
}

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
-- Filter by city (use quotes for text values)
WHERE city = ;`,
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
-- Sort alphabetically by student_name (ASC is default)
ORDER BY ;`,
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
-- Keep only the first 5 rows
LIMIT ;`,
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
-- Sort by enrollment_count from highest to lowest
ORDER BY ;`,
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
-- Keep only courses with more than one enrollment
HAVING ;`,
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
-- JOIN courses and match course_id
JOIN courses c ON ;`,
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
-- Keep every student even without a program
LEFT JOIN programs p ON ;`,
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
-- Group averages per course_id
GROUP BY ;`,
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
-- Filter to Hyderabad students only
WHERE s.city = ;`,
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
-- Sort cities alphabetically
ORDER BY ;`,
    solutionSql: `SELECT DISTINCT city
FROM students
ORDER BY city;`,
    validationMode: 'ordered',
  },
]

const HOSPITAL_QUESTIONS: SqlPracticeQuestion[] = [
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
-- Filter to scheduled appointments only
WHERE status = ;`,
    solutionSql: `SELECT appointment_id, patient_id, scheduled_at
FROM appointments
WHERE status = 'scheduled';`,
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
    hints: ['JOIN doctors and departments on department_id.', 'Alias departments.name AS department_name.'],
    starterSql: `SELECT d.full_name, dept.name AS department_name
FROM doctors d
JOIN departments dept ON ;`,
    solutionSql: `SELECT d.full_name, dept.name AS department_name
FROM doctors d
JOIN departments dept ON d.department_id = dept.department_id;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q3-patient-names',
    title: 'List patient names',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'Return full_name and mrn for every patient.',
    learningObjective: 'Practice basic SELECT from the patients table.',
    expectedColumns: ['full_name', 'mrn'],
    hints: ['SELECT from patients.', 'Include full_name and mrn columns.'],
    starterSql: HOSPITAL_STARTER_QUERY,
    solutionSql: `SELECT full_name, mrn
FROM patients;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q4-pending-bills',
    title: 'Pending hospital bills',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement: 'List bill_id, patient_id, and amount for bills with status pending.',
    learningObjective: 'Filter billing rows by status.',
    expectedColumns: ['bill_id', 'patient_id', 'amount'],
    hints: ['Query the billing table.', "WHERE status = 'pending'."],
    starterSql: `SELECT bill_id, patient_id, amount
FROM billing
-- Filter to pending bills only
WHERE status = ;`,
    solutionSql: `SELECT bill_id, patient_id, amount
FROM billing
WHERE status = 'pending';`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q5-appointments-per-doctor',
    title: 'Appointments per doctor',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement: 'For each doctor_id, count how many appointments exist. Show appointment_count.',
    learningObjective: 'Use GROUP BY and COUNT on appointments.',
    expectedColumns: ['doctor_id', 'appointment_count'],
    hints: ['GROUP BY doctor_id.', 'Use COUNT(*) AS appointment_count.'],
    starterSql: `SELECT doctor_id, COUNT(*) AS appointment_count
FROM appointments
-- Group counts per doctor_id
GROUP BY ;`,
    solutionSql: `SELECT doctor_id, COUNT(*) AS appointment_count
FROM appointments
GROUP BY doctor_id;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q6-departments-by-floor',
    title: 'Departments by floor',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'List department name and floor ordered by floor ascending.',
    learningObjective: 'Use ORDER BY on numeric columns.',
    expectedColumns: ['name', 'floor'],
    hints: ['SELECT name, floor FROM departments.', 'ORDER BY floor.'],
    starterSql: `SELECT name, floor
FROM departments
-- Sort by floor ascending (ASC is default)
ORDER BY ;`,
    solutionSql: `SELECT name, floor
FROM departments
ORDER BY floor;`,
    validationMode: 'ordered',
  },
  {
    id: 'hosp-q7-patient-insurance',
    title: 'Patients with insurance providers',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      'Show every patient full_name and their insurance provider. Use LEFT JOIN so patients without insurance still appear.',
    learningObjective: 'Use LEFT JOIN between patients and insurance.',
    expectedColumns: ['full_name', 'provider'],
    hints: ['FROM patients LEFT JOIN insurance.', 'Select full_name and provider.'],
    starterSql: `SELECT p.full_name, i.provider
FROM patients p
-- Keep every patient even without insurance
LEFT JOIN insurance i ON ;`,
    solutionSql: `SELECT p.full_name, i.provider
FROM patients p
LEFT JOIN insurance i ON p.patient_id = i.patient_id;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q8-count-patients',
    title: 'Count all patients',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'aggregates',
    problemStatement: 'Return the total number of patients as total_patients.',
    learningObjective: 'Use COUNT(*) with an alias.',
    expectedColumns: ['total_patients'],
    hints: ['COUNT(*) from patients.', 'Alias as total_patients.'],
    starterSql: `SELECT COUNT(*) AS total_patients
FROM patients;`,
    solutionSql: `SELECT COUNT(*) AS total_patients
FROM patients;`,
    validationMode: 'aggregate',
  },
]

const SHIPPING_QUESTIONS: SqlPracticeQuestion[] = [
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
-- Filter orders above 1000
WHERE total_amount > ;`,
    solutionSql: `SELECT order_id, customer_id, total_amount
FROM orders
WHERE total_amount > 1000;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q2-customer-list',
    title: 'List customers',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'Return company_name and country for all customers.',
    learningObjective: 'Practice basic SELECT from customers.',
    expectedColumns: ['company_name', 'country'],
    hints: ['SELECT from customers.', 'Include company_name and country.'],
    starterSql: SHIPPING_STARTER_QUERY,
    solutionSql: `SELECT company_name, country
FROM customers;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q3-shipped-orders',
    title: 'Shipped orders',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement: 'List order_id and order_date for orders with status shipped.',
    learningObjective: 'Filter orders by status.',
    expectedColumns: ['order_id', 'order_date'],
    hints: ['Query orders.', "WHERE status = 'shipped'."],
    starterSql: `SELECT order_id, order_date
FROM orders
-- Filter to shipped orders only
WHERE status = ;`,
    solutionSql: `SELECT order_id, order_date
FROM orders
WHERE status = 'shipped';`,
    validationMode: 'default',
  },
  {
    id: 'ship-q4-carrier-shipment-count',
    title: 'Shipments per carrier',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each carrier name, show how many shipments they handle. Include shipment_count.',
    learningObjective: 'JOIN shipments to carriers and use GROUP BY.',
    expectedColumns: ['name', 'shipment_count'],
    hints: ['JOIN carriers and shipments.', 'GROUP BY carrier name and COUNT shipments.'],
    starterSql: `SELECT c.name, COUNT(*) AS shipment_count
FROM carriers c
JOIN shipments s ON c.carrier_id = s.carrier_id
-- Group shipment counts per carrier name
GROUP BY ;`,
    solutionSql: `SELECT c.name, COUNT(*) AS shipment_count
FROM carriers c
JOIN shipments s ON c.carrier_id = s.carrier_id
GROUP BY c.name;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q5-customer-order-totals',
    title: 'Total order value per customer',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each company_name, calculate total_spent as the sum of order total_amount values.',
    learningObjective: 'Combine JOIN with SUM and GROUP BY.',
    expectedColumns: ['company_name', 'total_spent'],
    hints: ['JOIN customers and orders.', 'Use SUM(total_amount) AS total_spent.'],
    starterSql: `SELECT c.company_name, SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
-- Group totals per company_name
GROUP BY ;`,
    solutionSql: `SELECT c.company_name, ROUND(SUM(o.total_amount), 2) AS total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.company_name;`,
    validationMode: 'aggregate',
    validation: { numericTolerance: 0.05 },
  },
  {
    id: 'ship-q6-heavy-packages',
    title: 'Heavy packages',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement: 'List package_id and weight_kg for packages heavier than 20 kg.',
    learningObjective: 'Filter numeric package weights.',
    expectedColumns: ['package_id', 'weight_kg'],
    hints: ['Query packages.', 'WHERE weight_kg > 20.'],
    starterSql: `SELECT package_id, weight_kg
FROM packages
-- Packages heavier than 20 kg
WHERE weight_kg > ;`,
    solutionSql: `SELECT package_id, weight_kg
FROM packages
WHERE weight_kg > 20;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q7-unshipped-orders',
    title: 'Orders without shipments',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      'Find order_id values for orders that have no matching shipment. Use a LEFT JOIN approach.',
    learningObjective: 'Use LEFT JOIN and filter where the right side is NULL.',
    expectedColumns: ['order_id'],
    hints: ['LEFT JOIN orders to shipments.', 'WHERE shipment_id IS NULL.'],
    starterSql: `SELECT o.order_id
FROM orders o
LEFT JOIN shipments s ON o.order_id = s.order_id
-- Keep orders with no matching shipment
WHERE ;`,
    solutionSql: `SELECT o.order_id
FROM orders o
LEFT JOIN shipments s ON o.order_id = s.order_id
WHERE s.shipment_id IS NULL;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q8-orders-by-date',
    title: 'Orders by date',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'List order_id and order_date ordered by order_date ascending.',
    learningObjective: 'Use ORDER BY on date columns.',
    expectedColumns: ['order_id', 'order_date'],
    hints: ['SELECT order_id, order_date FROM orders.', 'ORDER BY order_date.'],
    starterSql: `SELECT order_id, order_date
FROM orders
-- Sort by order_date ascending
ORDER BY ;`,
    solutionSql: `SELECT order_id, order_date
FROM orders
ORDER BY order_date;`,
    validationMode: 'ordered',
  },
]

export const SQL_PRACTICE_QUESTIONS: SqlPracticeQuestion[] = [
  ...UNIVERSITY_QUESTIONS,
  ...UNIVERSITY_QUESTIONS_EXPANSION,
  ...HOSPITAL_QUESTIONS,
  ...HOSPITAL_QUESTIONS_EXPANSION,
  ...SHIPPING_QUESTIONS,
  ...SHIPPING_QUESTIONS_EXPANSION,
]

/** Group practice questions by topic for a given database. */
export function getQuestionsByTopic(
  databaseId: SqlDatabaseId,
  topic: SqlPracticeTopic,
): SqlPracticeQuestion[] {
  return SQL_PRACTICE_QUESTIONS.filter((q) => q.databaseId === databaseId && q.topic === topic)
}

/** Return all question IDs (for integrity checks). */
export function getAllQuestionIds(): string[] {
  return SQL_PRACTICE_QUESTIONS.map((q) => q.id)
}

export function getQuestionById(id: string): SqlPracticeQuestion | undefined {
  return SQL_PRACTICE_QUESTIONS.find((q) => q.id === id)
}

export function getQuestionsForDatabase(databaseId: SqlDatabaseId): SqlPracticeQuestion[] {
  return SQL_PRACTICE_QUESTIONS.filter((q) => q.databaseId === databaseId)
}

export function getUniversityQuestions(): SqlPracticeQuestion[] {
  return getQuestionsForDatabase('university_system')
}

export function getDefaultQuestionForDatabase(databaseId: SqlPracticeQuestion['databaseId']): SqlPracticeQuestion {
  return getQuestionsForDatabase(databaseId)[0] ?? SQL_PRACTICE_QUESTIONS[0]
}

export function isCheckableQuestion(question: SqlPracticeQuestion): boolean {
  return Boolean(question.solutionSql)
}

export function getNextQuestion(
  currentId: string,
  questions: SqlPracticeQuestion[],
): SqlPracticeQuestion | null {
  const index = questions.findIndex((q) => q.id === currentId)
  if (index < 0 || index >= questions.length - 1) return null
  return questions[index + 1] ?? null
}

export function getAnotherQuestionByTopic(
  current: SqlPracticeQuestion,
  questions: SqlPracticeQuestion[],
): SqlPracticeQuestion | null {
  return questions.find((q) => q.topic === current.topic && q.id !== current.id) ?? null
}

/** @deprecated Use isCheckableQuestion */
export function isUniversityCheckableQuestion(question: SqlPracticeQuestion): boolean {
  return isCheckableQuestion(question)
}
