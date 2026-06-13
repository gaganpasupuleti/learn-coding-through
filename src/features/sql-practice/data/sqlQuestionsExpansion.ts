import type { SqlPracticeQuestion } from '../types/sqlPractice.types'

/** Phase 9 — additional university_system practice questions (uni-q13 … uni-q25). */
export const UNIVERSITY_QUESTIONS_EXPANSION: SqlPracticeQuestion[] = [
  {
    id: 'uni-q13-course-catalog',
    title: 'Course catalog sorted',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'select',
    problemStatement: 'List course_code and course_name for all courses, ordered by course_code.',
    learningObjective: 'Practice SELECT with ORDER BY on text columns.',
    expectedColumns: ['course_code', 'course_name'],
    hints: [
      'Query the courses table.',
      'SELECT course_code and course_name.',
      'Add ORDER BY course_code.',
    ],
    starterSql: `SELECT course_code, course_name
FROM courses
ORDER BY ;`,
    solutionSql: `SELECT course_code, course_name
FROM courses
ORDER BY course_code;`,
    validationMode: 'ordered',
  },
  {
    id: 'uni-q14-bengaluru-students',
    title: 'Students in Bengaluru',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement: "Return student_name and email for students who live in 'Bengaluru'.",
    learningObjective: 'Filter rows with a string equality condition.',
    expectedColumns: ['student_name', 'email'],
    hints: [
      'Use the students table.',
      "WHERE city = 'Bengaluru'.",
      'Select student_name and email.',
    ],
    starterSql: `SELECT student_name, email
FROM students
WHERE city = ;`,
    solutionSql: `SELECT student_name, email
FROM students
WHERE city = 'Bengaluru';`,
    validationMode: 'default',
  },
  {
    id: 'uni-q15-students-per-city',
    title: 'Students per city',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'aggregates',
    problemStatement:
      'For each city, show how many students live there. Return city and student_count ordered by student_count descending.',
    learningObjective: 'Use GROUP BY with COUNT and ORDER BY.',
    expectedColumns: ['city', 'student_count'],
    hints: [
      'GROUP BY city from students.',
      'COUNT(*) AS student_count.',
      'ORDER BY student_count DESC.',
    ],
    starterSql: `SELECT city, COUNT(*) AS student_count
FROM students
GROUP BY city
ORDER BY ;`,
    solutionSql: `SELECT city, COUNT(*) AS student_count
FROM students
GROUP BY city
ORDER BY student_count DESC;`,
    validationMode: 'ordered',
  },
  {
    id: 'uni-q16-faculty-departments',
    title: 'Faculty and departments',
    databaseId: 'university_system',
    difficulty: 'easy',
    topic: 'joins',
    problemStatement: 'Show each faculty member name with their department name.',
    learningObjective: 'Join faculty to departments on department_id.',
    expectedColumns: ['faculty_name', 'department_name'],
    hints: [
      'JOIN faculty and departments.',
      'Match on department_id.',
      'Select faculty_name and department_name.',
    ],
    starterSql: `SELECT f.faculty_name, d.department_name
FROM faculty f
JOIN departments d ON ;`,
    solutionSql: `SELECT f.faculty_name, d.department_name
FROM faculty f
JOIN departments d ON f.department_id = d.department_id;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q17-courses-per-department',
    title: 'Courses per department',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each department_name, count how many courses belong to that department. Show department_name and course_count.',
    learningObjective: 'Combine JOIN with GROUP BY and COUNT.',
    expectedColumns: ['department_name', 'course_count'],
    hints: [
      'JOIN courses to departments.',
      'GROUP BY department_name.',
      'COUNT(*) AS course_count.',
    ],
    starterSql: `SELECT d.department_name, COUNT(*) AS course_count
FROM courses c
JOIN departments d ON c.department_id = d.department_id
GROUP BY ;`,
    solutionSql: `SELECT d.department_name, COUNT(*) AS course_count
FROM courses c
JOIN departments d ON c.department_id = d.department_id
GROUP BY d.department_name;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q18-departments-many-courses',
    title: 'Departments with many courses',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'Which departments have at least 3 courses? Return department_name and course_count.',
    learningObjective: 'Use HAVING to filter grouped results.',
    expectedColumns: ['department_name', 'course_count'],
    hints: [
      'GROUP BY department_name after joining courses and departments.',
      'HAVING COUNT(*) >= 3.',
    ],
    starterSql: `SELECT d.department_name, COUNT(*) AS course_count
FROM courses c
JOIN departments d ON c.department_id = d.department_id
GROUP BY d.department_name
HAVING ;`,
    solutionSql: `SELECT d.department_name, COUNT(*) AS course_count
FROM courses c
JOIN departments d ON c.department_id = d.department_id
GROUP BY d.department_name
HAVING COUNT(*) >= 3;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q19-multi-course-students',
    title: 'Students in multiple courses',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'Find students enrolled in more than one course. Return student_name and course_count.',
    learningObjective: 'GROUP BY student and filter with HAVING.',
    expectedColumns: ['student_name', 'course_count'],
    hints: [
      'JOIN students and enrollments.',
      'GROUP BY student_name.',
      'HAVING COUNT(*) > 1.',
    ],
    starterSql: `SELECT s.student_name, COUNT(*) AS course_count
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
GROUP BY s.student_name
HAVING ;`,
    solutionSql: `SELECT s.student_name, COUNT(*) AS course_count
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
GROUP BY s.student_name
HAVING COUNT(*) > 1;`,
    validationMode: 'default',
  },
  {
    id: 'uni-q20-top-enrolled-course',
    title: 'Most enrolled course',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      'Which course has the highest number of enrollments? Return course_name and enrollment_count (one row).',
    learningObjective: 'Aggregate enrollments, join to courses, and use ORDER BY with LIMIT.',
    expectedColumns: ['course_name', 'enrollment_count'],
    hints: [
      'COUNT enrollments per course.',
      'JOIN courses for course_name.',
      'ORDER BY enrollment_count DESC LIMIT 1.',
    ],
    starterSql: `SELECT c.course_name, COUNT(*) AS enrollment_count
FROM enrollments e
JOIN courses c ON e.course_id = c.course_id
GROUP BY c.course_name
ORDER BY enrollment_count DESC
LIMIT ;`,
    solutionSql: `SELECT c.course_name, COUNT(*) AS enrollment_count
FROM enrollments e
JOIN courses c ON e.course_id = c.course_id
GROUP BY c.course_name
ORDER BY enrollment_count DESC
LIMIT 1;`,
    validationMode: 'ordered',
  },
  {
    id: 'uni-q21-unenrolled-students',
    title: 'Students not in Machine Learning',
    databaseId: 'university_system',
    difficulty: 'hard',
    topic: 'joins',
    problemStatement:
      "List student_name for students who are not enrolled in the 'Machine Learning' course. Use a LEFT JOIN pattern to find missing matches.",
    learningObjective: 'Use LEFT JOIN with a filtered join condition and IS NULL.',
    expectedColumns: ['student_name'],
    hints: [
      'LEFT JOIN enrollments and courses; filter course_name in the ON clause.',
      'WHERE course_id IS NULL keeps students with no ML enrollment.',
      'Use DISTINCT or GROUP BY if duplicate names appear.',
    ],
    starterSql: `SELECT DISTINCT s.student_name
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
LEFT JOIN courses c ON e.course_id = c.course_id
  AND c.course_name = 'Machine Learning'
WHERE ;`,
    solutionSql: `SELECT DISTINCT s.student_name
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
LEFT JOIN courses c ON e.course_id = c.course_id
  AND c.course_name = 'Machine Learning'
WHERE c.course_id IS NULL
ORDER BY s.student_name;`,
    validationMode: 'ordered',
  },
  {
    id: 'uni-q22-avg-grade-by-student',
    title: 'Average grade per student',
    databaseId: 'university_system',
    difficulty: 'hard',
    topic: 'aggregates',
    problemStatement:
      'For each student_name, calculate the average numeric_grade across their graded enrollments as avg_grade.',
    learningObjective: 'Chain JOINs from grades through enrollments to students.',
    expectedColumns: ['student_name', 'avg_grade'],
    hints: [
      'JOIN grades → enrollments → students.',
      'AVG(numeric_grade) AS avg_grade.',
      'GROUP BY student_name.',
    ],
    starterSql: `SELECT s.student_name, AVG(g.numeric_grade) AS avg_grade
FROM grades g
JOIN enrollments e ON g.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
GROUP BY ;`,
    solutionSql: `SELECT s.student_name, ROUND(AVG(g.numeric_grade), 2) AS avg_grade
FROM grades g
JOIN enrollments e ON g.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
GROUP BY s.student_name;`,
    validationMode: 'aggregate',
    validation: { numericTolerance: 0.05 },
  },
  {
    id: 'uni-q23-fall-2024-enrollments',
    title: 'Fall 2024 enrollments',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'filtering',
    problemStatement:
      "List enrollment_id and student_id for enrollments in the 'Fall 2024' semester.",
    learningObjective: 'Filter using a JOIN to the semesters table.',
    expectedColumns: ['enrollment_id', 'student_id'],
    hints: [
      'JOIN enrollments and semesters.',
      "WHERE semester_name = 'Fall 2024'.",
    ],
    starterSql: `SELECT e.enrollment_id, e.student_id
FROM enrollments e
JOIN semesters s ON e.semester_id = s.semester_id
WHERE s.semester_name = ;`,
    solutionSql: `SELECT e.enrollment_id, e.student_id
FROM enrollments e
JOIN semesters s ON e.semester_id = s.semester_id
WHERE s.semester_name = 'Fall 2024';`,
    validationMode: 'default',
  },
  {
    id: 'uni-q24-high-performing-students',
    title: 'Students with A grades',
    databaseId: 'university_system',
    difficulty: 'hard',
    topic: 'subqueries',
    problemStatement:
      "Return distinct student_name values for students who have at least one letter_grade of 'A'.",
    learningObjective: 'Combine JOINs with DISTINCT and grade filtering.',
    expectedColumns: ['student_name'],
    hints: [
      'JOIN grades through enrollments to students.',
      "WHERE letter_grade = 'A'.",
      'Use SELECT DISTINCT.',
    ],
    starterSql: `SELECT DISTINCT s.student_name
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN grades g ON e.enrollment_id = g.enrollment_id
WHERE g.letter_grade = ;`,
    solutionSql: `SELECT DISTINCT s.student_name
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN grades g ON e.enrollment_id = g.enrollment_id
WHERE g.letter_grade = 'A';`,
    validationMode: 'default',
  },
  {
    id: 'uni-q25-total-credits-enrolled',
    title: 'Total credits per student',
    databaseId: 'university_system',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each student_name, calculate total_credits as the sum of credits from all enrolled courses.',
    learningObjective: 'Use SUM with multi-table JOINs.',
    expectedColumns: ['student_name', 'total_credits'],
    hints: [
      'JOIN students → enrollments → courses.',
      'SUM(credits) AS total_credits.',
      'GROUP BY student_name.',
    ],
    starterSql: `SELECT s.student_name, SUM(c.credits) AS total_credits
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
GROUP BY ;`,
    solutionSql: `SELECT s.student_name, SUM(c.credits) AS total_credits
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
GROUP BY s.student_name;`,
    validationMode: 'default',
  },
]

/** Phase 9 — additional hospital_management practice questions (hosp-q9 … hosp-q20). */
export const HOSPITAL_QUESTIONS_EXPANSION: SqlPracticeQuestion[] = [
  {
    id: 'hosp-q9-appointments-by-status',
    title: 'Appointments by status',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'aggregates',
    problemStatement: 'Count appointments grouped by status. Return status and appointment_count.',
    learningObjective: 'Use GROUP BY on a status column.',
    expectedColumns: ['status', 'appointment_count'],
    hints: ['GROUP BY status.', 'COUNT(*) AS appointment_count.', 'Query appointments.'],
    starterSql: `SELECT status, COUNT(*) AS appointment_count
FROM appointments
GROUP BY ;`,
    solutionSql: `SELECT status, COUNT(*) AS appointment_count
FROM appointments
GROUP BY status;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q10-busiest-doctor',
    title: 'Doctor with most appointments',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'Which doctor has the most appointments? Return full_name and appointment_count (one row; break ties by doctor_id).',
    learningObjective: 'JOIN doctors to appointments, aggregate, and LIMIT.',
    expectedColumns: ['full_name', 'appointment_count'],
    hints: [
      'JOIN doctors and appointments.',
      'GROUP BY doctor_id and full_name.',
      'ORDER BY appointment_count DESC, doctor_id LIMIT 1.',
    ],
    starterSql: `SELECT d.full_name, COUNT(*) AS appointment_count
FROM doctors d
JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id, d.full_name
ORDER BY appointment_count DESC
LIMIT ;`,
    solutionSql: `SELECT d.full_name, COUNT(*) AS appointment_count
FROM doctors d
JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id, d.full_name
ORDER BY appointment_count DESC, d.doctor_id
LIMIT 1;`,
    validationMode: 'ordered',
  },
  {
    id: 'hosp-q11-uninsured-patients',
    title: 'Patients without insurance',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement: 'List full_name for patients who have no insurance record. Use LEFT JOIN.',
    learningObjective: 'Find patients missing related rows with LEFT JOIN and IS NULL.',
    expectedColumns: ['full_name'],
    hints: [
      'FROM patients LEFT JOIN insurance.',
      'WHERE insurance_id IS NULL.',
      'Select patient full_name.',
    ],
    starterSql: `SELECT p.full_name
FROM patients p
LEFT JOIN insurance i ON p.patient_id = i.patient_id
WHERE ;`,
    solutionSql: `SELECT p.full_name
FROM patients p
LEFT JOIN insurance i ON p.patient_id = i.patient_id
WHERE i.insurance_id IS NULL;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q12-high-pending-bills',
    title: 'Large pending bills',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement:
      "Return bill_id, patient_id, and amount for pending bills where amount is greater than 500.",
    learningObjective: 'Combine status and numeric filters.',
    expectedColumns: ['bill_id', 'patient_id', 'amount'],
    hints: [
      'Query billing.',
      "WHERE status = 'pending'.",
      'AND amount > 500.',
    ],
    starterSql: `SELECT bill_id, patient_id, amount
FROM billing
WHERE status = 'pending'
  AND amount > ;`,
    solutionSql: `SELECT bill_id, patient_id, amount
FROM billing
WHERE status = 'pending'
  AND amount > 500;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q13-avg-bill-by-status',
    title: 'Average bill by status',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement: 'For each billing status, show the average bill amount as avg_amount.',
    learningObjective: 'Use AVG with GROUP BY.',
    expectedColumns: ['status', 'avg_amount'],
    hints: ['GROUP BY status.', 'AVG(amount) AS avg_amount.', 'FROM billing.'],
    starterSql: `SELECT status, AVG(amount) AS avg_amount
FROM billing
GROUP BY ;`,
    solutionSql: `SELECT status, ROUND(AVG(amount), 2) AS avg_amount
FROM billing
GROUP BY status;`,
    validationMode: 'aggregate',
    validation: { numericTolerance: 0.05 },
  },
  {
    id: 'hosp-q14-dept-appointment-count',
    title: 'Appointments per department',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      'Count appointments per department name. Return department_name and appointment_count.',
    learningObjective: 'Join appointments → doctors → departments and aggregate.',
    expectedColumns: ['department_name', 'appointment_count'],
    hints: [
      'JOIN appointments, doctors, and departments.',
      'GROUP BY department name.',
      'COUNT(*) AS appointment_count.',
    ],
    starterSql: `SELECT dept.name AS department_name, COUNT(*) AS appointment_count
FROM appointments a
JOIN doctors d ON a.doctor_id = d.doctor_id
JOIN departments dept ON d.department_id = dept.department_id
GROUP BY ;`,
    solutionSql: `SELECT dept.name AS department_name, COUNT(*) AS appointment_count
FROM appointments a
JOIN doctors d ON a.doctor_id = d.doctor_id
JOIN departments dept ON d.department_id = dept.department_id
GROUP BY dept.name;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q15-completed-appointments',
    title: 'Completed appointments',
    databaseId: 'hospital_management',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement:
      "List appointment_id and scheduled_at for appointments with status 'completed'.",
    learningObjective: 'Filter appointment rows by status.',
    expectedColumns: ['appointment_id', 'scheduled_at'],
    hints: [
      'SELECT from appointments.',
      "WHERE status = 'completed'.",
    ],
    starterSql: `SELECT appointment_id, scheduled_at
FROM appointments
WHERE status = ;`,
    solutionSql: `SELECT appointment_id, scheduled_at
FROM appointments
WHERE status = 'completed';`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q16-doctors-multiple-appointments',
    title: 'Doctors with multiple appointments',
    databaseId: 'hospital_management',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'Which doctors have more than one appointment? Return full_name and appointment_count.',
    learningObjective: 'GROUP BY doctor and use HAVING.',
    expectedColumns: ['full_name', 'appointment_count'],
    hints: [
      'JOIN doctors and appointments.',
      'GROUP BY full_name.',
      'HAVING COUNT(*) > 1.',
    ],
    starterSql: `SELECT d.full_name, COUNT(*) AS appointment_count
FROM doctors d
JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.full_name
HAVING ;`,
    solutionSql: `SELECT d.full_name, COUNT(*) AS appointment_count
FROM doctors d
JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.full_name
HAVING COUNT(*) > 1;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q17-total-billing-per-patient',
    title: 'Total billing per patient',
    databaseId: 'hospital_management',
    difficulty: 'hard',
    topic: 'aggregates',
    problemStatement:
      'For each patient full_name, calculate total_billed as the sum of all bill amounts.',
    learningObjective: 'JOIN patients and billing, then SUM and GROUP BY.',
    expectedColumns: ['full_name', 'total_billed'],
    hints: [
      'JOIN patients and billing on patient_id.',
      'SUM(amount) AS total_billed.',
      'GROUP BY full_name.',
    ],
    starterSql: `SELECT p.full_name, SUM(b.amount) AS total_billed
FROM patients p
JOIN billing b ON p.patient_id = b.patient_id
GROUP BY ;`,
    solutionSql: `SELECT p.full_name, ROUND(SUM(b.amount), 2) AS total_billed
FROM patients p
JOIN billing b ON p.patient_id = b.patient_id
GROUP BY p.full_name;`,
    validationMode: 'aggregate',
    validation: { numericTolerance: 0.05 },
  },
  {
    id: 'hosp-q18-open-admissions',
    title: 'Patients still admitted',
    databaseId: 'hospital_management',
    difficulty: 'hard',
    topic: 'filtering',
    problemStatement:
      'List patient_id and admitted_at for admissions where discharged_at IS NULL.',
    learningObjective: 'Filter rows using IS NULL.',
    expectedColumns: ['patient_id', 'admitted_at'],
    hints: [
      'Query admissions.',
      'WHERE discharged_at IS NULL.',
    ],
    starterSql: `SELECT patient_id, admitted_at
FROM admissions
WHERE discharged_at ;`,
    solutionSql: `SELECT patient_id, admitted_at
FROM admissions
WHERE discharged_at IS NULL;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q19-bill-size-category',
    title: 'Bill size categories',
    databaseId: 'hospital_management',
    difficulty: 'hard',
    topic: 'aggregates',
    problemStatement:
      'For each bill_id and amount, assign bill_size: "high" if amount >= 800, otherwise "standard". Return bill_id, amount, bill_size.',
    learningObjective: 'Use CASE WHEN for conditional labels.',
    expectedColumns: ['bill_id', 'amount', 'bill_size'],
    hints: [
      'SELECT from billing.',
      "CASE WHEN amount >= 800 THEN 'high' ELSE 'standard' END AS bill_size.",
    ],
    starterSql: `SELECT bill_id, amount,
  CASE
    WHEN amount >= 800 THEN 'high'
    ELSE 'standard'
  END AS bill_size
FROM billing;`,
    solutionSql: `SELECT bill_id, amount,
  CASE
    WHEN amount >= 800 THEN 'high'
    ELSE 'standard'
  END AS bill_size
FROM billing;`,
    validationMode: 'default',
  },
  {
    id: 'hosp-q20-recent-lab-results',
    title: 'Recent lab results',
    databaseId: 'hospital_management',
    difficulty: 'hard',
    topic: 'filtering',
    problemStatement:
      "List patient_id, test_name, and recorded_at for lab results recorded in 2025 (recorded_at starts with '2025-').",
    learningObjective: 'Filter date-like text columns with LIKE.',
    expectedColumns: ['patient_id', 'test_name', 'recorded_at'],
    hints: [
      'Query lab_results.',
      "WHERE recorded_at LIKE '2025-%'.",
    ],
    starterSql: `SELECT patient_id, test_name, recorded_at
FROM lab_results
WHERE recorded_at LIKE ;`,
    solutionSql: `SELECT patient_id, test_name, recorded_at
FROM lab_results
WHERE recorded_at LIKE '2025-%';`,
    validationMode: 'default',
  },
]

/** Phase 9 — additional shipping_logistics practice questions (ship-q9 … ship-q20). */
export const SHIPPING_QUESTIONS_EXPANSION: SqlPracticeQuestion[] = [
  {
    id: 'ship-q9-orders-by-country',
    title: 'Orders by customer country',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'joins',
    problemStatement: 'Show order_id, company_name, and country for every order with its customer.',
    learningObjective: 'JOIN orders and customers.',
    expectedColumns: ['order_id', 'company_name', 'country'],
    hints: [
      'JOIN orders and customers on customer_id.',
      'Select order_id, company_name, country.',
    ],
    starterSql: `SELECT o.order_id, c.company_name, c.country
FROM orders o
JOIN customers c ON ;`,
    solutionSql: `SELECT o.order_id, c.company_name, c.country
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q10-repeat-customers',
    title: 'Customers with multiple orders',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'Which customers placed more than one order? Return company_name and order_count.',
    learningObjective: 'GROUP BY customer and filter with HAVING.',
    expectedColumns: ['company_name', 'order_count'],
    hints: [
      'JOIN customers and orders.',
      'GROUP BY company_name.',
      'HAVING COUNT(*) > 1.',
    ],
    starterSql: `SELECT c.company_name, COUNT(*) AS order_count
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.company_name
HAVING ;`,
    solutionSql: `SELECT c.company_name, COUNT(*) AS order_count
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.company_name
HAVING COUNT(*) > 1;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q11-avg-package-weight',
    title: 'Average package weight per shipment',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each shipment_id, calculate avg_weight_kg as the average package weight.',
    learningObjective: 'GROUP BY shipment and use AVG.',
    expectedColumns: ['shipment_id', 'avg_weight_kg'],
    hints: [
      'GROUP BY shipment_id from packages.',
      'AVG(weight_kg) AS avg_weight_kg.',
    ],
    starterSql: `SELECT shipment_id, AVG(weight_kg) AS avg_weight_kg
FROM packages
GROUP BY ;`,
    solutionSql: `SELECT shipment_id, ROUND(AVG(weight_kg), 2) AS avg_weight_kg
FROM packages
GROUP BY shipment_id;`,
    validationMode: 'aggregate',
    validation: { numericTolerance: 0.05 },
  },
  {
    id: 'ship-q12-processing-orders',
    title: 'Processing orders',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement:
      "Return order_id and total_amount for orders with status 'processing'.",
    learningObjective: 'Filter orders by status.',
    expectedColumns: ['order_id', 'total_amount'],
    hints: [
      'SELECT from orders.',
      "WHERE status = 'processing'.",
    ],
    starterSql: `SELECT order_id, total_amount
FROM orders
WHERE status = ;`,
    solutionSql: `SELECT order_id, total_amount
FROM orders
WHERE status = 'processing';`,
    validationMode: 'default',
  },
  {
    id: 'ship-q13-revenue-by-status',
    title: 'Revenue by order status',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'aggregates',
    problemStatement:
      'For each order status, calculate total_revenue as the sum of total_amount.',
    learningObjective: 'Use SUM with GROUP BY on status.',
    expectedColumns: ['status', 'total_revenue'],
    hints: [
      'GROUP BY status.',
      'SUM(total_amount) AS total_revenue.',
    ],
    starterSql: `SELECT status, SUM(total_amount) AS total_revenue
FROM orders
GROUP BY ;`,
    solutionSql: `SELECT status, ROUND(SUM(total_amount), 2) AS total_revenue
FROM orders
GROUP BY status;`,
    validationMode: 'aggregate',
    validation: { numericTolerance: 0.05 },
  },
  {
    id: 'ship-q14-unpaid-invoices',
    title: 'Unpaid invoices',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement: 'List invoice_id, order_id, and amount for invoices that are not paid (paid = 0).',
    learningObjective: 'Filter boolean/integer flag columns.',
    expectedColumns: ['invoice_id', 'order_id', 'amount'],
    hints: [
      'Query invoices.',
      'WHERE paid = 0.',
    ],
    starterSql: `SELECT invoice_id, order_id, amount
FROM invoices
WHERE paid = ;`,
    solutionSql: `SELECT invoice_id, order_id, amount
FROM invoices
WHERE paid = 0;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q15-express-carrier-shipments',
    title: 'Express carrier shipments',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'joins',
    problemStatement:
      "Count shipments per carrier where service_level is 'Express'. Return carrier name and shipment_count.",
    learningObjective: 'JOIN carriers and shipments with a filter.',
    expectedColumns: ['name', 'shipment_count'],
    hints: [
      'JOIN carriers and shipments.',
      "WHERE service_level = 'Express'.",
      'GROUP BY carrier name.',
    ],
    starterSql: `SELECT c.name, COUNT(*) AS shipment_count
FROM carriers c
JOIN shipments s ON c.carrier_id = s.carrier_id
WHERE c.service_level = 'Express'
GROUP BY ;`,
    solutionSql: `SELECT c.name, COUNT(*) AS shipment_count
FROM carriers c
JOIN shipments s ON c.carrier_id = s.carrier_id
WHERE c.service_level = 'Express'
GROUP BY c.name;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q16-max-order-by-country',
    title: 'Highest order value per country',
    databaseId: 'shipping_logistics',
    difficulty: 'hard',
    topic: 'aggregates',
    problemStatement:
      'For each customer country, find the maximum order total_amount as max_order_value.',
    learningObjective: 'JOIN customers and orders, then MAX with GROUP BY.',
    expectedColumns: ['country', 'max_order_value'],
    hints: [
      'JOIN customers and orders.',
      'MAX(total_amount) AS max_order_value.',
      'GROUP BY country.',
    ],
    starterSql: `SELECT c.country, MAX(o.total_amount) AS max_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY ;`,
    solutionSql: `SELECT c.country, MAX(o.total_amount) AS max_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.country;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q17-heavy-packages-tracking',
    title: 'Heavy packages with tracking',
    databaseId: 'shipping_logistics',
    difficulty: 'medium',
    topic: 'filtering',
    problemStatement:
      'List package_id, weight_kg, and tracking_code for packages weighing more than 15 kg.',
    learningObjective: 'Filter numeric package weights.',
    expectedColumns: ['package_id', 'weight_kg', 'tracking_code'],
    hints: [
      'SELECT from packages.',
      'WHERE weight_kg > 15.',
    ],
    starterSql: `SELECT package_id, weight_kg, tracking_code
FROM packages
WHERE weight_kg > ;`,
    solutionSql: `SELECT package_id, weight_kg, tracking_code
FROM packages
WHERE weight_kg > 15;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q18-order-value-tier',
    title: 'Order value tiers',
    databaseId: 'shipping_logistics',
    difficulty: 'hard',
    topic: 'aggregates',
    problemStatement:
      'For each order_id and total_amount, label value_tier as "premium" when total_amount >= 2000, else "standard".',
    learningObjective: 'Use CASE WHEN for business tiers.',
    expectedColumns: ['order_id', 'total_amount', 'value_tier'],
    hints: [
      'SELECT from orders.',
      "CASE WHEN total_amount >= 2000 THEN 'premium' ELSE 'standard' END.",
    ],
    starterSql: `SELECT order_id, total_amount,
  CASE
    WHEN total_amount >= 2000 THEN 'premium'
    ELSE 'standard'
  END AS value_tier
FROM orders;`,
    solutionSql: `SELECT order_id, total_amount,
  CASE
    WHEN total_amount >= 2000 THEN 'premium'
    ELSE 'standard'
  END AS value_tier
FROM orders;`,
    validationMode: 'default',
  },
  {
    id: 'ship-q19-cancelled-orders',
    title: 'Cancelled orders',
    databaseId: 'shipping_logistics',
    difficulty: 'easy',
    topic: 'filtering',
    problemStatement: "List order_id and order_date for orders with status 'cancelled'.",
    learningObjective: 'Filter by order status.',
    expectedColumns: ['order_id', 'order_date'],
    hints: [
      'SELECT from orders.',
      "WHERE status = 'cancelled'.",
    ],
    starterSql: `SELECT order_id, order_date
FROM orders
WHERE status = ;`,
    solutionSql: `SELECT order_id, order_date
FROM orders
WHERE status = 'cancelled';`,
    validationMode: 'default',
  },
  {
    id: 'ship-q20-india-customer-orders',
    title: 'Orders from India customers',
    databaseId: 'shipping_logistics',
    difficulty: 'hard',
    topic: 'subqueries',
    problemStatement:
      "Return order_id and total_amount for orders placed by customers in country 'IN'.",
    learningObjective: 'Filter orders using a JOIN to customers on country.',
    expectedColumns: ['order_id', 'total_amount'],
    hints: [
      'JOIN orders and customers.',
      "WHERE country = 'IN'.",
    ],
    starterSql: `SELECT o.order_id, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE c.country = ;`,
    solutionSql: `SELECT o.order_id, o.total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE c.country = 'IN';`,
    validationMode: 'default',
  },
]
