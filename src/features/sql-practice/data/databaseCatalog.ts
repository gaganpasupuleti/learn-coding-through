import type { SqlColumnMeta, SqlDatabaseId, SqlDatabaseMeta, SqlTableMeta } from '../types/sqlPractice.types'

function col(
  name: string,
  dataType: string,
  opts?: { pk?: boolean; fk?: { table: string; column: string } },
): SqlColumnMeta {
  return {
    name,
    dataType,
    isPrimaryKey: opts?.pk,
    isForeignKey: Boolean(opts?.fk),
    references: opts?.fk,
  }
}

function table(name: string, rowCount: number, columns: SqlColumnMeta[]): SqlTableMeta {
  return { name, rowCount, columns }
}

const UNIVERSITY_TABLES: SqlTableMeta[] = [
  table('universities', 3, [
    col('university_id', 'INTEGER', { pk: true }),
    col('university_name', 'TEXT'),
    col('city', 'TEXT'),
    col('founded_year', 'INTEGER'),
  ]),
  table('colleges', 4, [
    col('college_id', 'INTEGER', { pk: true }),
    col('university_id', 'INTEGER', { fk: { table: 'universities', column: 'university_id' } }),
    col('college_name', 'TEXT'),
  ]),
  table('departments', 6, [
    col('department_id', 'INTEGER', { pk: true }),
    col('college_id', 'INTEGER', { fk: { table: 'colleges', column: 'college_id' } }),
    col('department_name', 'TEXT'),
  ]),
  table('programs', 6, [
    col('program_id', 'INTEGER', { pk: true }),
    col('department_id', 'INTEGER', { fk: { table: 'departments', column: 'department_id' } }),
    col('program_name', 'TEXT'),
    col('degree_level', 'TEXT'),
  ]),
  table('courses', 10, [
    col('course_id', 'INTEGER', { pk: true }),
    col('department_id', 'INTEGER', { fk: { table: 'departments', column: 'department_id' } }),
    col('course_code', 'TEXT'),
    col('course_name', 'TEXT'),
    col('credits', 'INTEGER'),
  ]),
  table('students', 15, [
    col('student_id', 'INTEGER', { pk: true }),
    col('program_id', 'INTEGER', { fk: { table: 'programs', column: 'program_id' } }),
    col('student_name', 'TEXT'),
    col('email', 'TEXT'),
    col('city', 'TEXT'),
    col('enrollment_year', 'INTEGER'),
  ]),
  table('faculty', 10, [
    col('faculty_id', 'INTEGER', { pk: true }),
    col('department_id', 'INTEGER', { fk: { table: 'departments', column: 'department_id' } }),
    col('faculty_name', 'TEXT'),
    col('title', 'TEXT'),
  ]),
  table('semesters', 4, [
    col('semester_id', 'INTEGER', { pk: true }),
    col('semester_name', 'TEXT'),
    col('start_date', 'TEXT'),
    col('end_date', 'TEXT'),
  ]),
  table('enrollments', 20, [
    col('enrollment_id', 'INTEGER', { pk: true }),
    col('student_id', 'INTEGER', { fk: { table: 'students', column: 'student_id' } }),
    col('course_id', 'INTEGER', { fk: { table: 'courses', column: 'course_id' } }),
    col('semester_id', 'INTEGER', { fk: { table: 'semesters', column: 'semester_id' } }),
  ]),
  table('grades', 15, [
    col('grade_id', 'INTEGER', { pk: true }),
    col('enrollment_id', 'INTEGER', { fk: { table: 'enrollments', column: 'enrollment_id' } }),
    col('letter_grade', 'TEXT'),
    col('numeric_grade', 'REAL'),
  ]),
  table('classrooms', 8, [
    col('classroom_id', 'INTEGER', { pk: true }),
    col('building', 'TEXT'),
    col('room_number', 'TEXT'),
    col('capacity', 'INTEGER'),
  ]),
  table('attendance', 12, [
    col('attendance_id', 'INTEGER', { pk: true }),
    col('enrollment_id', 'INTEGER', { fk: { table: 'enrollments', column: 'enrollment_id' } }),
    col('class_date', 'TEXT'),
    col('status', 'TEXT'),
  ]),
]

const HOSPITAL_TABLES: SqlTableMeta[] = [
  table('patients', 8420, [
    col('patient_id', 'INT', { pk: true }),
    col('mrn', 'VARCHAR(20)'),
    col('full_name', 'VARCHAR(120)'),
    col('date_of_birth', 'DATE'),
    col('blood_type', 'CHAR(3)'),
  ]),
  table('doctors', 210, [
    col('doctor_id', 'INT', { pk: true }),
    col('full_name', 'VARCHAR(120)'),
    col('specialty', 'VARCHAR(80)'),
    col('department_id', 'INT', { fk: { table: 'departments', column: 'department_id' } }),
  ]),
  table('nurses', 480, [
    col('nurse_id', 'INT', { pk: true }),
    col('full_name', 'VARCHAR(120)'),
    col('ward', 'VARCHAR(60)'),
    col('department_id', 'INT', { fk: { table: 'departments', column: 'department_id' } }),
  ]),
  table('departments', 18, [
    col('department_id', 'INT', { pk: true }),
    col('name', 'VARCHAR(100)'),
    col('floor', 'SMALLINT'),
  ]),
  table('appointments', 12400, [
    col('appointment_id', 'INT', { pk: true }),
    col('patient_id', 'INT', { fk: { table: 'patients', column: 'patient_id' } }),
    col('doctor_id', 'INT', { fk: { table: 'doctors', column: 'doctor_id' } }),
    col('scheduled_at', 'TIMESTAMP'),
    col('status', 'VARCHAR(30)'),
  ]),
  table('admissions', 2100, [
    col('admission_id', 'INT', { pk: true }),
    col('patient_id', 'INT', { fk: { table: 'patients', column: 'patient_id' } }),
    col('room_id', 'INT', { fk: { table: 'rooms', column: 'room_id' } }),
    col('admitted_at', 'TIMESTAMP'),
    col('discharged_at', 'TIMESTAMP'),
  ]),
  table('rooms', 120, [
    col('room_id', 'INT', { pk: true }),
    col('ward', 'VARCHAR(40)'),
    col('bed_count', 'TINYINT'),
    col('is_icu', 'BOOLEAN'),
  ]),
  table('prescriptions', 18600, [
    col('prescription_id', 'INT', { pk: true }),
    col('patient_id', 'INT', { fk: { table: 'patients', column: 'patient_id' } }),
    col('doctor_id', 'INT', { fk: { table: 'doctors', column: 'doctor_id' } }),
    col('medication_id', 'INT', { fk: { table: 'medications', column: 'medication_id' } }),
    col('dosage', 'VARCHAR(60)'),
  ]),
  table('medications', 640, [
    col('medication_id', 'INT', { pk: true }),
    col('name', 'VARCHAR(120)'),
    col('form', 'VARCHAR(40)'),
    col('unit_cost', 'DECIMAL(10,2)'),
  ]),
  table('lab_results', 45200, [
    col('result_id', 'INT', { pk: true }),
    col('patient_id', 'INT', { fk: { table: 'patients', column: 'patient_id' } }),
    col('test_name', 'VARCHAR(100)'),
    col('result_value', 'VARCHAR(80)'),
    col('recorded_at', 'TIMESTAMP'),
  ]),
  table('billing', 9800, [
    col('bill_id', 'INT', { pk: true }),
    col('patient_id', 'INT', { fk: { table: 'patients', column: 'patient_id' } }),
    col('amount', 'DECIMAL(12,2)'),
    col('status', 'VARCHAR(20)'),
    col('issued_at', 'DATE'),
  ]),
  table('insurance', 7200, [
    col('insurance_id', 'INT', { pk: true }),
    col('patient_id', 'INT', { fk: { table: 'patients', column: 'patient_id' } }),
    col('provider', 'VARCHAR(100)'),
    col('policy_number', 'VARCHAR(40)'),
  ]),
]

const SHIPPING_TABLES: SqlTableMeta[] = [
  table('customers', 3200, [
    col('customer_id', 'INT', { pk: true }),
    col('company_name', 'VARCHAR(150)'),
    col('contact_email', 'VARCHAR(120)'),
    col('country', 'CHAR(2)'),
  ]),
  table('orders', 28400, [
    col('order_id', 'INT', { pk: true }),
    col('customer_id', 'INT', { fk: { table: 'customers', column: 'customer_id' } }),
    col('order_date', 'DATE'),
    col('status', 'VARCHAR(30)'),
    col('total_amount', 'DECIMAL(14,2)'),
  ]),
  table('shipments', 31200, [
    col('shipment_id', 'INT', { pk: true }),
    col('order_id', 'INT', { fk: { table: 'orders', column: 'order_id' } }),
    col('carrier_id', 'INT', { fk: { table: 'carriers', column: 'carrier_id' } }),
    col('shipped_at', 'TIMESTAMP'),
    col('eta', 'DATE'),
  ]),
  table('carriers', 28, [
    col('carrier_id', 'INT', { pk: true }),
    col('name', 'VARCHAR(100)'),
    col('service_level', 'VARCHAR(40)'),
  ]),
  table('packages', 41000, [
    col('package_id', 'INT', { pk: true }),
    col('shipment_id', 'INT', { fk: { table: 'shipments', column: 'shipment_id' } }),
    col('weight_kg', 'DECIMAL(8,2)'),
    col('tracking_code', 'VARCHAR(32)'),
  ]),
  table('warehouses', 16, [
    col('warehouse_id', 'INT', { pk: true }),
    col('name', 'VARCHAR(100)'),
    col('city', 'VARCHAR(80)'),
    col('capacity_pallets', 'INT'),
  ]),
  table('inventory', 18600, [
    col('inventory_id', 'INT', { pk: true }),
    col('warehouse_id', 'INT', { fk: { table: 'warehouses', column: 'warehouse_id' } }),
    col('sku', 'VARCHAR(40)'),
    col('quantity_on_hand', 'INT'),
  ]),
  table('routes', 420, [
    col('route_id', 'INT', { pk: true }),
    col('origin_city', 'VARCHAR(80)'),
    col('destination_city', 'VARCHAR(80)'),
    col('distance_km', 'INT'),
  ]),
  table('drivers', 340, [
    col('driver_id', 'INT', { pk: true }),
    col('full_name', 'VARCHAR(120)'),
    col('license_number', 'VARCHAR(30)'),
    col('carrier_id', 'INT', { fk: { table: 'carriers', column: 'carrier_id' } }),
  ]),
  table('vehicles', 280, [
    col('vehicle_id', 'INT', { pk: true }),
    col('plate_number', 'VARCHAR(20)'),
    col('vehicle_type', 'VARCHAR(40)'),
    col('driver_id', 'INT', { fk: { table: 'drivers', column: 'driver_id' } }),
  ]),
  table('tracking_events', 128000, [
    col('event_id', 'BIGINT', { pk: true }),
    col('package_id', 'INT', { fk: { table: 'packages', column: 'package_id' } }),
    col('event_type', 'VARCHAR(50)'),
    col('event_at', 'TIMESTAMP'),
    col('location', 'VARCHAR(120)'),
  ]),
  table('invoices', 26800, [
    col('invoice_id', 'INT', { pk: true }),
    col('order_id', 'INT', { fk: { table: 'orders', column: 'order_id' } }),
    col('amount', 'DECIMAL(14,2)'),
    col('issued_at', 'DATE'),
    col('paid', 'BOOLEAN'),
  ]),
]

export const SQL_DATABASE_CATALOG: SqlDatabaseMeta[] = [
  {
    id: 'university_system',
    displayName: 'University System',
    description: 'Students, courses, enrollments, and campus operations.',
    tables: UNIVERSITY_TABLES,
    viewNames: ['v_active_enrollments', 'v_course_catalog'],
    storedProcedureNames: ['sp_enroll_student', 'sp_assign_grade'],
  },
  {
    id: 'hospital_management',
    displayName: 'Hospital Management',
    description: 'Patients, clinical staff, appointments, and billing.',
    tables: HOSPITAL_TABLES,
    viewNames: ['v_open_appointments', 'v_ward_occupancy'],
    storedProcedureNames: ['sp_admit_patient', 'sp_discharge_patient'],
  },
  {
    id: 'shipping_logistics',
    displayName: 'Shipping & Logistics',
    description: 'Orders, shipments, warehouses, and tracking.',
    tables: SHIPPING_TABLES,
    viewNames: ['v_in_transit_shipments', 'v_low_stock_skus'],
    storedProcedureNames: ['sp_create_shipment', 'sp_update_tracking'],
  },
]

export function getDatabaseById(id: SqlDatabaseId): SqlDatabaseMeta {
  const db = SQL_DATABASE_CATALOG.find((d) => d.id === id)
  if (!db) throw new Error(`Unknown database: ${id}`)
  return db
}

export function listDatabaseIds(): SqlDatabaseId[] {
  return SQL_DATABASE_CATALOG.map((d) => d.id)
}
