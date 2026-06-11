/**
 * Trusted seed DDL/DML for in-browser university_system (sql.js).
 * Not subject to user SQL guardrails.
 */
export const UNIVERSITY_SEED_STATEMENTS: string[] = [
  `CREATE TABLE universities (
    university_id INTEGER PRIMARY KEY,
    university_name TEXT NOT NULL,
    city TEXT NOT NULL,
    founded_year INTEGER
  )`,
  `CREATE TABLE colleges (
    college_id INTEGER PRIMARY KEY,
    university_id INTEGER NOT NULL REFERENCES universities(university_id),
    college_name TEXT NOT NULL
  )`,
  `CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY,
    college_id INTEGER NOT NULL REFERENCES colleges(college_id),
    department_name TEXT NOT NULL
  )`,
  `CREATE TABLE programs (
    program_id INTEGER PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(department_id),
    program_name TEXT NOT NULL,
    degree_level TEXT NOT NULL
  )`,
  `CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(department_id),
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    credits INTEGER NOT NULL
  )`,
  `CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(program_id),
    student_name TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    enrollment_year INTEGER NOT NULL
  )`,
  `CREATE TABLE faculty (
    faculty_id INTEGER PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(department_id),
    faculty_name TEXT NOT NULL,
    title TEXT NOT NULL
  )`,
  `CREATE TABLE semesters (
    semester_id INTEGER PRIMARY KEY,
    semester_name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL
  )`,
  `CREATE TABLE enrollments (
    enrollment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    course_id INTEGER NOT NULL REFERENCES courses(course_id),
    semester_id INTEGER NOT NULL REFERENCES semesters(semester_id)
  )`,
  `CREATE TABLE grades (
    grade_id INTEGER PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(enrollment_id),
    letter_grade TEXT NOT NULL,
    numeric_grade REAL NOT NULL
  )`,
  `CREATE TABLE classrooms (
    classroom_id INTEGER PRIMARY KEY,
    building TEXT NOT NULL,
    room_number TEXT NOT NULL,
    capacity INTEGER NOT NULL
  )`,
  `CREATE TABLE attendance (
    attendance_id INTEGER PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(enrollment_id),
    class_date TEXT NOT NULL,
    status TEXT NOT NULL
  )`,
  `INSERT INTO universities VALUES
    (1, 'CodeQuest University', 'Hyderabad', 1998),
    (2, 'Northern Tech Institute', 'Bengaluru', 2005),
    (3, 'Western Arts College', 'Pune', 2010)`,
  `INSERT INTO colleges VALUES
    (1, 1, 'College of Engineering'),
    (2, 1, 'College of Science'),
    (3, 2, 'School of Computing'),
    (4, 3, 'School of Design')`,
  `INSERT INTO departments VALUES
    (1, 1, 'Computer Science'),
    (2, 1, 'Electrical Engineering'),
    (3, 2, 'Mathematics'),
    (4, 2, 'Physics'),
    (5, 3, 'Software Engineering'),
    (6, 4, 'Visual Design')`,
  `INSERT INTO programs VALUES
    (1, 1, 'B.Tech Computer Science', 'Undergraduate'),
    (2, 1, 'M.Tech AI', 'Postgraduate'),
    (3, 2, 'B.Tech Electrical', 'Undergraduate'),
    (4, 3, 'B.Sc Mathematics', 'Undergraduate'),
    (5, 5, 'B.Tech Software Engineering', 'Undergraduate'),
    (6, 6, 'B.Des Interaction Design', 'Undergraduate')`,
  `INSERT INTO courses VALUES
    (1, 1, 'CS101', 'Introduction to Programming', 4),
    (2, 1, 'CS201', 'Data Structures', 4),
    (3, 1, 'CS301', 'Databases', 3),
    (4, 2, 'EE101', 'Circuit Theory', 4),
    (5, 3, 'MA101', 'Calculus I', 3),
    (6, 3, 'MA201', 'Linear Algebra', 3),
    (7, 5, 'SE101', 'Software Fundamentals', 4),
    (8, 5, 'SE201', 'Web Development', 3),
    (9, 1, 'CS401', 'Machine Learning', 3),
    (10, 6, 'DS101', 'Design Basics', 3)`,
  `INSERT INTO students VALUES
    (1, 1, 'Aarav Sharma', 'aarav@student.edu', 'Hyderabad', 2023),
    (2, 1, 'Priya Reddy', 'priya@student.edu', 'Hyderabad', 2023),
    (3, 1, 'Rohan Mehta', 'rohan@student.edu', 'Bengaluru', 2022),
    (4, 2, 'Sneha Iyer', 'sneha@student.edu', 'Chennai', 2024),
    (5, 3, 'Karthik Naidu', 'karthik@student.edu', 'Hyderabad', 2023),
    (6, 4, 'Ananya Das', 'ananya@student.edu', 'Kolkata', 2022),
    (7, 5, 'Vikram Singh', 'vikram@student.edu', 'Pune', 2023),
    (8, 1, 'Meera Patel', 'meera@student.edu', 'Hyderabad', 2024),
    (9, 6, 'Arjun Kulkarni', 'arjun@student.edu', 'Mumbai', 2023),
    (10, 1, 'Divya Rao', 'divya@student.edu', 'Hyderabad', 2022),
    (11, 5, 'Nikhil Verma', 'nikhil@student.edu', 'Delhi', 2024),
    (12, 1, 'Lakshmi Menon', 'lakshmi@student.edu', 'Hyderabad', 2023),
    (13, 3, 'Farhan Ali', 'farhan@student.edu', 'Hyderabad', 2022),
    (14, 1, 'Isha Gupta', 'isha@student.edu', 'Jaipur', 2024),
    (15, 2, 'Sanjay Pillai', 'sanjay@student.edu', 'Hyderabad', 2023)`,
  `INSERT INTO faculty VALUES
    (1, 1, 'Dr. Kavitha Nair', 'Professor'),
    (2, 1, 'Dr. Amit Joshi', 'Associate Professor'),
    (3, 2, 'Dr. Elena Markov', 'Professor'),
    (4, 3, 'Dr. Rahul Desai', 'Assistant Professor'),
    (5, 5, 'Prof. James Lee', 'Professor'),
    (6, 1, 'Dr. Sunita Rao', 'Lecturer'),
    (7, 6, 'Prof. Maria Gomez', 'Associate Professor'),
    (8, 5, 'Dr. Tom Bradley', 'Lecturer'),
    (9, 3, 'Dr. Helen Cho', 'Professor'),
    (10, 2, 'Dr. Omar Farid', 'Assistant Professor')`,
  `INSERT INTO semesters VALUES
    (1, 'Fall 2024', '2024-08-15', '2024-12-15'),
    (2, 'Spring 2025', '2025-01-10', '2025-05-20'),
    (3, 'Summer 2025', '2025-06-01', '2025-07-31'),
    (4, 'Fall 2025', '2025-08-15', '2025-12-15')`,
  `INSERT INTO enrollments VALUES
    (1, 1, 1, 1), (2, 1, 3, 1), (3, 2, 1, 1), (4, 2, 2, 1),
    (5, 3, 2, 2), (6, 3, 5, 2), (7, 4, 3, 2), (8, 5, 1, 1),
    (9, 5, 8, 2), (10, 6, 5, 1), (11, 7, 7, 2), (12, 8, 1, 1),
    (13, 8, 3, 2), (14, 9, 10, 1), (15, 10, 2, 2), (16, 11, 8, 2),
    (17, 12, 1, 1), (18, 13, 3, 2), (19, 14, 9, 1), (20, 15, 2, 2)`,
  `INSERT INTO grades VALUES
    (1, 1, 'A', 92.5), (2, 2, 'B+', 87.0), (3, 3, 'A-', 90.0), (4, 4, 'B', 84.0),
    (5, 5, 'A', 93.0), (6, 6, 'C+', 78.5), (7, 7, 'B+', 88.0), (8, 8, 'A', 95.0),
    (9, 9, 'B', 83.0), (10, 10, 'A-', 91.0), (11, 11, 'B+', 86.5), (12, 12, 'A', 94.0),
    (13, 13, 'B', 82.0), (14, 14, 'A', 96.0), (15, 15, 'C', 75.0)`,
  `INSERT INTO classrooms VALUES
    (1, 'Engineering Block A', '101', 60),
    (2, 'Engineering Block A', '204', 45),
    (3, 'Science Block B', '310', 80),
    (4, 'Science Block B', '115', 40),
    (5, 'Design Studio', 'D1', 30),
    (6, 'Computing Center', 'CC-12', 50),
    (7, 'Engineering Block C', 'C-02', 55),
    (8, 'Main Auditorium', 'AUD', 200)`,
  `INSERT INTO attendance VALUES
    (1, 1, '2024-09-02', 'present'),
    (2, 1, '2024-09-04', 'present'),
    (3, 2, '2024-09-02', 'absent'),
    (4, 3, '2024-09-02', 'present'),
    (5, 4, '2024-09-03', 'present'),
    (6, 5, '2025-01-15', 'present'),
    (7, 8, '2024-09-02', 'present'),
    (8, 9, '2025-01-16', 'late'),
    (9, 12, '2024-09-02', 'present'),
    (10, 14, '2024-09-05', 'present'),
    (11, 17, '2024-09-02', 'present'),
    (12, 20, '2025-01-15', 'absent')`,
]
