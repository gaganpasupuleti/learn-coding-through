/**
 * Trusted seed DDL/DML for in-browser hospital_management (sql.js).
 */
export const HOSPITAL_SEED_STATEMENTS: string[] = [
  `CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    floor INTEGER NOT NULL
  )`,
  `CREATE TABLE rooms (
    room_id INTEGER PRIMARY KEY,
    ward TEXT NOT NULL,
    bed_count INTEGER NOT NULL,
    is_icu INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE patients (
    patient_id INTEGER PRIMARY KEY,
    mrn TEXT NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    blood_type TEXT NOT NULL
  )`,
  `CREATE TABLE medications (
    medication_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    form TEXT NOT NULL,
    unit_cost REAL NOT NULL
  )`,
  `CREATE TABLE doctors (
    doctor_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(department_id)
  )`,
  `CREATE TABLE nurses (
    nurse_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    ward TEXT NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(department_id)
  )`,
  `CREATE TABLE appointments (
    appointment_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    scheduled_at TEXT NOT NULL,
    status TEXT NOT NULL
  )`,
  `CREATE TABLE admissions (
    admission_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    room_id INTEGER NOT NULL REFERENCES rooms(room_id),
    admitted_at TEXT NOT NULL,
    discharged_at TEXT
  )`,
  `CREATE TABLE prescriptions (
    prescription_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    medication_id INTEGER NOT NULL REFERENCES medications(medication_id),
    dosage TEXT NOT NULL
  )`,
  `CREATE TABLE lab_results (
    result_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    test_name TEXT NOT NULL,
    result_value TEXT NOT NULL,
    recorded_at TEXT NOT NULL
  )`,
  `CREATE TABLE billing (
    bill_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    issued_at TEXT NOT NULL
  )`,
  `CREATE TABLE insurance (
    insurance_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    provider TEXT NOT NULL,
    policy_number TEXT NOT NULL
  )`,
  `INSERT INTO departments VALUES
    (1, 'Cardiology', 2),
    (2, 'Emergency', 1),
    (3, 'Pediatrics', 3),
    (4, 'Orthopedics', 4),
    (5, 'Radiology', 2)`,
  `INSERT INTO rooms VALUES
    (1, 'General A', 4, 0),
    (2, 'General B', 4, 0),
    (3, 'ICU', 2, 1),
    (4, 'Pediatric Ward', 6, 0)`,
  `INSERT INTO patients VALUES
    (1, 'MRN-1001', 'Anita Desai', '1985-03-12', 'A+'),
    (2, 'MRN-1002', 'Ravi Kumar', '1978-07-22', 'O+'),
    (3, 'MRN-1003', 'Meena Shah', '1992-11-05', 'B+'),
    (4, 'MRN-1004', 'James Wilson', '1965-01-30', 'AB+'),
    (5, 'MRN-1005', 'Sara Thomas', '2010-09-18', 'O-'),
    (6, 'MRN-1006', 'Omar Hassan', '1988-04-09', 'A-'),
    (7, 'MRN-1007', 'Linda Chen', '1975-12-25', 'B-'),
    (8, 'MRN-1008', 'Priya Nair', '1995-06-14', 'O+')`,
  `INSERT INTO medications VALUES
    (1, 'Amoxicillin', 'Capsule', 12.50),
    (2, 'Ibuprofen', 'Tablet', 4.25),
    (3, 'Metformin', 'Tablet', 8.00),
    (4, 'Atorvastatin', 'Tablet', 15.75),
    (5, 'Salbutamol', 'Inhaler', 22.00)`,
  `INSERT INTO doctors VALUES
    (1, 'Dr. Helen Cho', 'Cardiology', 1),
    (2, 'Dr. Amit Patel', 'Emergency Medicine', 2),
    (3, 'Dr. Maria Lopez', 'Pediatrics', 3),
    (4, 'Dr. Tom Bradley', 'Orthopedics', 4),
    (5, 'Dr. Sunita Rao', 'Radiology', 5)`,
  `INSERT INTO nurses VALUES
    (1, 'Nurse Emma Clark', 'General A', 1),
    (2, 'Nurse Raj Singh', 'Emergency', 2),
    (3, 'Nurse Zoe Martin', 'Pediatric Ward', 3)`,
  `INSERT INTO appointments VALUES
    (1, 1, 1, '2025-06-10 09:00:00', 'scheduled'),
    (2, 2, 2, '2025-06-10 10:30:00', 'scheduled'),
    (3, 3, 3, '2025-06-11 14:00:00', 'scheduled'),
    (4, 4, 1, '2025-06-09 11:00:00', 'completed'),
    (5, 5, 3, '2025-06-12 09:30:00', 'scheduled'),
    (6, 6, 2, '2025-06-08 16:00:00', 'cancelled'),
    (7, 7, 4, '2025-06-13 08:00:00', 'scheduled'),
    (8, 8, 5, '2025-06-10 15:00:00', 'scheduled')`,
  `INSERT INTO admissions VALUES
    (1, 2, 3, '2025-06-01 18:00:00', '2025-06-05 10:00:00'),
    (2, 4, 1, '2025-06-07 09:00:00', NULL),
    (3, 5, 4, '2025-06-09 12:00:00', NULL)`,
  `INSERT INTO prescriptions VALUES
    (1, 1, 1, 4, '10mg daily'),
    (2, 2, 2, 2, '400mg twice daily'),
    (3, 3, 3, 1, '500mg three times daily'),
    (4, 6, 2, 5, '2 puffs as needed')`,
  `INSERT INTO lab_results VALUES
    (1, 1, 'Cholesterol', '210', '2025-06-01 08:00:00'),
    (2, 2, 'Blood Glucose', '145', '2025-06-02 07:30:00'),
    (3, 3, 'CBC', 'Normal', '2025-06-03 09:15:00'),
    (4, 4, 'X-Ray Chest', 'Clear', '2025-06-07 11:00:00'),
    (5, 7, 'HbA1c', '6.8', '2025-06-04 10:00:00')`,
  `INSERT INTO billing VALUES
    (1, 1, 450.00, 'paid', '2025-06-02'),
    (2, 2, 1250.00, 'pending', '2025-06-05'),
    (3, 3, 320.00, 'paid', '2025-06-04'),
    (4, 4, 890.00, 'pending', '2025-06-08'),
    (5, 5, 180.00, 'paid', '2025-06-09'),
    (6, 6, 560.00, 'pending', '2025-06-06')`,
  `INSERT INTO insurance VALUES
    (1, 1, 'HealthFirst', 'HF-8821'),
    (2, 2, 'MediCare Plus', 'MC-4410'),
    (3, 4, 'BlueShield', 'BS-9902'),
    (4, 7, 'HealthFirst', 'HF-7733')`,
]
