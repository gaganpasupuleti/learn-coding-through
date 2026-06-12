/**
 * Trusted seed DDL/DML for in-browser shipping_logistics (sql.js).
 */
export const SHIPPING_SEED_STATEMENTS: string[] = [
  `CREATE TABLE carriers (
    carrier_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    service_level TEXT NOT NULL
  )`,
  `CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    country TEXT NOT NULL
  )`,
  `CREATE TABLE warehouses (
    warehouse_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    capacity_pallets INTEGER NOT NULL
  )`,
  `CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    order_date TEXT NOT NULL,
    status TEXT NOT NULL,
    total_amount REAL NOT NULL
  )`,
  `CREATE TABLE drivers (
    driver_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    carrier_id INTEGER NOT NULL REFERENCES carriers(carrier_id)
  )`,
  `CREATE TABLE shipments (
    shipment_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id),
    carrier_id INTEGER NOT NULL REFERENCES carriers(carrier_id),
    shipped_at TEXT NOT NULL,
    eta TEXT NOT NULL
  )`,
  `CREATE TABLE vehicles (
    vehicle_id INTEGER PRIMARY KEY,
    plate_number TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    driver_id INTEGER NOT NULL REFERENCES drivers(driver_id)
  )`,
  `CREATE TABLE packages (
    package_id INTEGER PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES shipments(shipment_id),
    weight_kg REAL NOT NULL,
    tracking_code TEXT NOT NULL
  )`,
  `CREATE TABLE inventory (
    inventory_id INTEGER PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    sku TEXT NOT NULL,
    quantity_on_hand INTEGER NOT NULL
  )`,
  `CREATE TABLE routes (
    route_id INTEGER PRIMARY KEY,
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    distance_km INTEGER NOT NULL
  )`,
  `CREATE TABLE tracking_events (
    event_id INTEGER PRIMARY KEY,
    package_id INTEGER NOT NULL REFERENCES packages(package_id),
    event_type TEXT NOT NULL,
    event_at TEXT NOT NULL,
    location TEXT NOT NULL
  )`,
  `CREATE TABLE invoices (
    invoice_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id),
    amount REAL NOT NULL,
    issued_at TEXT NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0
  )`,
  `INSERT INTO carriers VALUES
    (1, 'FastFreight', 'Express'),
    (2, 'GlobalPost', 'Standard'),
    (3, 'SwiftCargo', 'Express'),
    (4, 'RegionalHaul', 'Economy')`,
  `INSERT INTO customers VALUES
    (1, 'Acme Retail', 'orders@acme.com', 'US'),
    (2, 'Nova Electronics', 'logistics@nova.io', 'IN'),
    (3, 'GreenLeaf Foods', 'supply@greenleaf.co', 'US'),
    (4, 'Metro Furniture', 'shipping@metro.com', 'GB'),
    (5, 'BrightTech Labs', 'ops@brighttech.dev', 'IN')`,
  `INSERT INTO warehouses VALUES
    (1, 'Central Hub', 'Hyderabad', 500),
    (2, 'West Coast DC', 'Los Angeles', 800),
    (3, 'EU Gateway', 'Rotterdam', 650)`,
  `INSERT INTO orders VALUES
    (1, 1, '2025-05-01', 'delivered', 2450.00),
    (2, 2, '2025-05-03', 'shipped', 1890.50),
    (3, 3, '2025-05-05', 'processing', 780.25),
    (4, 1, '2025-05-08', 'shipped', 1520.00),
    (5, 4, '2025-05-10', 'delivered', 3200.75),
    (6, 5, '2025-05-12', 'processing', 450.00),
    (7, 2, '2025-05-15', 'cancelled', 990.00),
    (8, 3, '2025-05-18', 'shipped', 2100.00)`,
  `INSERT INTO drivers VALUES
    (1, 'Carlos Mendez', 'DL-CM-4421', 1),
    (2, 'Priya Sharma', 'DL-PS-8810', 2),
    (3, 'John Okafor', 'DL-JO-3302', 3)`,
  `INSERT INTO shipments VALUES
    (1, 1, 1, '2025-05-02 08:00:00', '2025-05-05'),
    (2, 2, 3, '2025-05-04 10:30:00', '2025-05-08'),
    (3, 4, 1, '2025-05-09 07:15:00', '2025-05-12'),
    (4, 5, 2, '2025-05-11 14:00:00', '2025-05-16'),
    (5, 8, 3, '2025-05-19 09:00:00', '2025-05-22')`,
  `INSERT INTO vehicles VALUES
    (1, 'TS-09-AB-1234', 'Van', 1),
    (2, 'KA-01-CD-5678', 'Truck', 2),
    (3, 'MH-12-EF-9012', 'Van', 3)`,
  `INSERT INTO packages VALUES
    (1, 1, 12.5, 'PKG-10001'),
    (2, 1, 8.0, 'PKG-10002'),
    (3, 2, 25.3, 'PKG-10003'),
    (4, 3, 15.0, 'PKG-10004'),
    (5, 4, 42.1, 'PKG-10005'),
    (6, 5, 18.7, 'PKG-10006')`,
  `INSERT INTO inventory VALUES
    (1, 1, 'SKU-001', 120),
    (2, 1, 'SKU-002', 45),
    (3, 2, 'SKU-010', 200),
    (4, 3, 'SKU-020', 80)`,
  `INSERT INTO routes VALUES
    (1, 'Hyderabad', 'Mumbai', 710),
    (2, 'Los Angeles', 'Seattle', 1800),
    (3, 'Rotterdam', 'Berlin', 650)`,
  `INSERT INTO tracking_events VALUES
    (1, 1, 'picked_up', '2025-05-02 08:00:00', 'Hyderabad Hub'),
    (2, 1, 'in_transit', '2025-05-03 12:00:00', 'Mumbai Sort'),
    (3, 3, 'picked_up', '2025-05-04 10:30:00', 'Hyderabad Hub'),
    (4, 5, 'delivered', '2025-05-16 16:00:00', 'London Depot')`,
  `INSERT INTO invoices VALUES
    (1, 1, 2450.00, '2025-05-02', 1),
    (2, 2, 1890.50, '2025-05-04', 0),
    (3, 4, 1520.00, '2025-05-09', 0),
    (4, 5, 3200.75, '2025-05-11', 1),
    (5, 8, 2100.00, '2025-05-19', 0)`,
]
