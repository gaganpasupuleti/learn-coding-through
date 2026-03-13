# Capstone Set 4 — Healthcare Appointment & Care Analytics

A full-stack implementation of a clinic appointment management system.

---

## Tech Stack

| Layer    | Technology                                |
|----------|-------------------------------------------|
| Backend  | C# 13 · .NET 10 Web API                   |
| Frontend | HTML5 · CSS3 · Bootstrap 5 · TypeScript 5 |

---

## Backend — `backend/`

### Architecture

```
HealthcareAppointment.Api/
├── Models/
│   ├── Patient.cs               # Patient entity
│   ├── Appointment.cs           # Appointment entity
│   └── AppointmentStatus.cs     # Lifecycle enum
├── Exceptions/
│   ├── DoubleBookingException.cs            # Same doctor/time conflict
│   └── InvalidStatusTransitionException.cs  # Bad status workflow
├── Dtos/
│   ├── PatientDtos.cs       # Create/Update/Response records
│   └── AppointmentDtos.cs   # Create/Update/Status/Response records
├── Repositories/
│   ├── IPatientRepository.cs           # Data-access interface
│   ├── IAppointmentRepository.cs       # Data-access interface
│   ├── InMemoryPatientRepository.cs    # Thread-safe in-memory impl
│   └── InMemoryAppointmentRepository.cs
├── Services/
│   ├── IPatientService.cs          # Business-logic interface
│   ├── IAppointmentService.cs      # Business-logic interface
│   ├── PatientService.cs           # Email uniqueness, CRUD
│   └── AppointmentService.cs       # Double-booking & status validation
├── Controllers/
│   ├── PatientsController.cs       # REST: /api/patients
│   └── AppointmentsController.cs   # REST: /api/appointments
└── Program.cs                      # DI registrations + CORS + pipeline
```

### Key Business Rules

- **Double Booking Prevention** — `AppointmentService` calls
  `IAppointmentRepository.FindConflictAsync` before every create/update and
  throws `DoubleBookingException` if the same doctor is already booked at
  that exact time slot (excluding cancelled appointments).

- **Status Transition Validation** — only the following transitions are allowed:

  | From       | Allowed to                              |
  |------------|-----------------------------------------|
  | Scheduled  | Confirmed, Cancelled                    |
  | Confirmed  | Completed, Cancelled, NoShow            |
  | Completed  | *(terminal)*                            |
  | Cancelled  | *(terminal)*                            |
  | NoShow     | *(terminal)*                            |

  Any other transition throws `InvalidStatusTransitionException`.

### Run locally

```bash
cd backend
dotnet run --project HealthcareAppointment.Api
# API available at https://localhost:5001  (or http://localhost:5000)
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/patients` | List all patients |
| GET    | `/api/patients/{id}` | Get patient by ID |
| POST   | `/api/patients` | Create patient |
| PUT    | `/api/patients/{id}` | Update patient |
| DELETE | `/api/patients/{id}` | Delete patient |
| GET    | `/api/appointments` | List all appointments |
| GET    | `/api/appointments/patient/{patientId}` | By patient |
| GET    | `/api/appointments/{id}` | Get by ID |
| POST   | `/api/appointments` | Schedule appointment |
| PUT    | `/api/appointments/{id}` | Update appointment |
| PATCH  | `/api/appointments/{id}/status` | Change status |
| DELETE | `/api/appointments/{id}` | Cancel appointment |

---

## Frontend — `frontend/`

### Architecture

```
frontend/
├── index.html          # SPA shell — all views live inside one HTML file
├── css/styles.css      # Sidebar layout + Bootstrap overrides
├── tsconfig.json       # TypeScript compiler configuration
├── package.json        # Dev dependencies (typescript)
└── src/
    ├── interfaces.ts   # TypeScript interfaces mirroring C# DTOs
    ├── apiService.ts   # Typed HTTP client for the .NET API
    └── app.ts          # SPA logic: routing, DOM manipulation, forms
```

### Build & run

```bash
cd frontend
npm install
npm run build          # compiles src/ → dist/
# Then open index.html in a browser (or serve with VS Code Live Server)
```

> **Important**: start the .NET API first so the frontend can reach
> `http://localhost:5000`. The API URL can be overridden at runtime by
> setting `window.CLINIC_API_URL` before the module loads.

### SPA Sections

| Section | Route (hash-free, DOM-swapped) |
|---------|-------------------------------|
| Dashboard | Default view — stat cards + upcoming appointments table |
| Patients  | Full CRUD table with Add/Edit/Delete modals |
| Appointments | Full CRUD + status-change workflow |

---

## Design Principles

- **SOLID** — each class has a single responsibility; services depend on
  repository *interfaces*, not concrete implementations.
- **OOP** — `sealed` classes prevent accidental subclassing; `record` DTOs
  provide value semantics.
- **DI** — all services and repositories are registered in `Program.cs`
  and injected via constructor parameters.
- **No database** — the in-memory repositories satisfy the "no DB" constraint
  while the interfaces make swapping to EF Core trivial.
