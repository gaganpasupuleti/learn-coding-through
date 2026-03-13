import { ClinicApiService } from "./apiService.js";
import {
  AppointmentStatus,
  type Appointment,
  type CreateAppointmentRequest,
  type CreatePatientRequest,
  type Patient,
} from "./interfaces.js";

// ── Bootstrap ──────────────────────────────────────────────────────────────────

const api = new ClinicApiService(
  (window as Window & { CLINIC_API_URL?: string }).CLINIC_API_URL ??
    "http://localhost:5000"
);

// ── State ──────────────────────────────────────────────────────────────────────

let patients: Patient[] = [];
let appointments: Appointment[] = [];
let editingPatientId: string | null = null;
let editingAppointmentId: string | null = null;

// ── DOM helpers ────────────────────────────────────────────────────────────────

function $(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function showToast(message: string, type: "success" | "danger" | "warning" = "success"): void {
  const container = document.getElementById("toast-container")!;
  const id = `toast-${Date.now()}`;
  container.insertAdjacentHTML(
    "beforeend",
    `<div id="${id}" class="toast align-items-center text-bg-${type} border-0 show" role="alert">
       <div class="d-flex">
         <div class="toast-body">${message}</div>
         <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
       </div>
     </div>`
  );
  setTimeout(() => document.getElementById(id)?.remove(), 4000);
}

function showSection(sectionId: string): void {
  document.querySelectorAll<HTMLElement>(".spa-section").forEach((s) => s.classList.add("d-none"));
  document.getElementById(sectionId)?.classList.remove("d-none");
  document.querySelectorAll<HTMLElement>(".nav-link[data-section]").forEach((link) => {
    link.classList.toggle("active", link.dataset.section === sectionId);
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", { dateStyle: "medium" });
}

function statusBadgeClass(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    [AppointmentStatus.Scheduled]: "bg-primary",
    [AppointmentStatus.Confirmed]: "bg-info text-dark",
    [AppointmentStatus.Completed]: "bg-success",
    [AppointmentStatus.Cancelled]: "bg-secondary",
    [AppointmentStatus.NoShow]: "bg-warning text-dark",
  };
  return map[status] ?? "bg-light text-dark";
}

// ── Patients ───────────────────────────────────────────────────────────────────

async function loadPatients(): Promise<void> {
  try {
    patients = await api.getPatients();
    renderPatientTable();
    populatePatientDropdowns();
  } catch {
    showToast("Failed to load patients.", "danger");
  }
}

function renderPatientTable(): void {
  const tbody = document.getElementById("patients-tbody")!;
  if (patients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No patients registered yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = patients
    .map(
      (p) => `
      <tr>
        <td>${escapeHtml(p.fullName)}</td>
        <td>${escapeHtml(p.email)}</td>
        <td>${escapeHtml(p.phoneNumber)}</td>
        <td>${formatDate(p.dateOfBirth)}</td>
        <td>${escapeHtml(p.address ?? "—")}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="handleEditPatient('${p.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="handleDeletePatient('${p.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`
    )
    .join("");
}

function populatePatientDropdowns(): void {
  const select = document.getElementById("apt-patient-id") as HTMLSelectElement | null;
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">-- Select Patient --</option>` +
    patients.map((p) => `<option value="${p.id}">${escapeHtml(p.fullName)}</option>`).join("");
  if (current) select.value = current;
}

function openPatientModal(patient?: Patient): void {
  editingPatientId = patient?.id ?? null;
  const form = document.getElementById("patient-form") as HTMLFormElement;
  form.reset();
  (document.getElementById("patient-modal-title") as HTMLElement).textContent =
    patient ? "Edit Patient" : "Add Patient";

  if (patient) {
    (document.getElementById("pt-first-name") as HTMLInputElement).value = patient.firstName;
    (document.getElementById("pt-last-name") as HTMLInputElement).value = patient.lastName;
    (document.getElementById("pt-email") as HTMLInputElement).value = patient.email;
    (document.getElementById("pt-phone") as HTMLInputElement).value = patient.phoneNumber;
    (document.getElementById("pt-dob") as HTMLInputElement).value = patient.dateOfBirth;
    (document.getElementById("pt-address") as HTMLInputElement).value = patient.address ?? "";
  }

  // @ts-ignore – Bootstrap JS is loaded via CDN
  new bootstrap.Modal(document.getElementById("patient-modal")!).show();
}

async function submitPatientForm(e: SubmitEvent): Promise<void> {
  e.preventDefault();
  const payload: CreatePatientRequest = {
    firstName: (document.getElementById("pt-first-name") as HTMLInputElement).value.trim(),
    lastName: (document.getElementById("pt-last-name") as HTMLInputElement).value.trim(),
    email: (document.getElementById("pt-email") as HTMLInputElement).value.trim(),
    phoneNumber: (document.getElementById("pt-phone") as HTMLInputElement).value.trim(),
    dateOfBirth: (document.getElementById("pt-dob") as HTMLInputElement).value,
    address: (document.getElementById("pt-address") as HTMLInputElement).value.trim() || null,
  };

  try {
    if (editingPatientId) {
      await api.updatePatient(editingPatientId, payload);
      showToast("Patient updated successfully.");
    } else {
      await api.createPatient(payload);
      showToast("Patient registered successfully.");
    }
    // @ts-ignore
    bootstrap.Modal.getInstance(document.getElementById("patient-modal")!)?.hide();
    await loadPatients();
  } catch (err: unknown) {
    const msg = (err as { message?: string }).message ?? "Failed to save patient.";
    showToast(msg, "danger");
  }
}

// Exposed to inline onclick handlers
(window as unknown as Record<string, unknown>)["handleEditPatient"] = (id: string) => {
  const p = patients.find((x) => x.id === id);
  if (p) openPatientModal(p);
};

(window as unknown as Record<string, unknown>)["handleDeletePatient"] = async (id: string) => {
  if (!confirm("Delete this patient? This cannot be undone.")) return;
  try {
    await api.deletePatient(id);
    showToast("Patient deleted.");
    await loadPatients();
  } catch (err: unknown) {
    showToast((err as { message?: string }).message ?? "Failed to delete patient.", "danger");
  }
};

// ── Appointments ───────────────────────────────────────────────────────────────

async function loadAppointments(): Promise<void> {
  try {
    appointments = await api.getAppointments();
    renderAppointmentTable();
  } catch {
    showToast("Failed to load appointments.", "danger");
  }
}

function renderAppointmentTable(): void {
  const tbody = document.getElementById("appointments-tbody")!;
  if (appointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No appointments scheduled yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = appointments
    .map((a) => {
      const patient = patients.find((p) => p.id === a.patientId);
      return `
      <tr>
        <td>${patient ? escapeHtml(patient.fullName) : a.patientId}</td>
        <td>${escapeHtml(a.doctorName)}</td>
        <td>${formatDateTime(a.scheduledAt)}</td>
        <td>${escapeHtml(a.reason)}</td>
        <td><span class="badge ${statusBadgeClass(a.status)}">${a.statusDisplay}</span></td>
        <td>${escapeHtml(a.notes ?? "—")}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="handleEditAppointment('${a.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="handleChangeStatus('${a.id}')">
            <i class="bi bi-arrow-repeat"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="handleCancelAppointment('${a.id}')">
            <i class="bi bi-x-circle"></i>
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

function openAppointmentModal(appointment?: Appointment): void {
  editingAppointmentId = appointment?.id ?? null;
  const form = document.getElementById("appointment-form") as HTMLFormElement;
  form.reset();
  (document.getElementById("apt-modal-title") as HTMLElement).textContent =
    appointment ? "Edit Appointment" : "Schedule Appointment";

  if (appointment) {
    (document.getElementById("apt-patient-id") as HTMLSelectElement).value = appointment.patientId;
    (document.getElementById("apt-doctor") as HTMLInputElement).value = appointment.doctorName;
    // Convert to local datetime-local format
    const dt = new Date(appointment.scheduledAt);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    (document.getElementById("apt-scheduled-at") as HTMLInputElement).value = local;
    (document.getElementById("apt-reason") as HTMLInputElement).value = appointment.reason;
    (document.getElementById("apt-notes") as HTMLTextAreaElement).value = appointment.notes ?? "";
  }

  // @ts-ignore
  new bootstrap.Modal(document.getElementById("appointment-modal")!).show();
}

async function submitAppointmentForm(e: SubmitEvent): Promise<void> {
  e.preventDefault();
  const scheduledLocalValue = (document.getElementById("apt-scheduled-at") as HTMLInputElement).value;
  const scheduledAt = new Date(scheduledLocalValue).toISOString();

  try {
    if (editingAppointmentId) {
      const payload = {
        doctorName: (document.getElementById("apt-doctor") as HTMLInputElement).value.trim(),
        scheduledAt,
        reason: (document.getElementById("apt-reason") as HTMLInputElement).value.trim(),
        notes: (document.getElementById("apt-notes") as HTMLTextAreaElement).value.trim() || null,
      };
      await api.updateAppointment(editingAppointmentId, payload);
      showToast("Appointment updated.");
    } else {
      const payload: CreateAppointmentRequest = {
        patientId: (document.getElementById("apt-patient-id") as HTMLSelectElement).value,
        doctorName: (document.getElementById("apt-doctor") as HTMLInputElement).value.trim(),
        scheduledAt,
        reason: (document.getElementById("apt-reason") as HTMLInputElement).value.trim(),
        notes: (document.getElementById("apt-notes") as HTMLTextAreaElement).value.trim() || null,
      };
      await api.createAppointment(payload);
      showToast("Appointment scheduled.");
    }
    // @ts-ignore
    bootstrap.Modal.getInstance(document.getElementById("appointment-modal")!)?.hide();
    await loadAppointments();
  } catch (err: unknown) {
    const msg = (err as { message?: string }).message ?? "Failed to save appointment.";
    showToast(msg, "danger");
  }
}

(window as unknown as Record<string, unknown>)["handleEditAppointment"] = (id: string) => {
  const a = appointments.find((x) => x.id === id);
  if (a) openAppointmentModal(a);
};

(window as unknown as Record<string, unknown>)["handleCancelAppointment"] = async (id: string) => {
  if (!confirm("Cancel this appointment?")) return;
  try {
    await api.cancelAppointment(id);
    showToast("Appointment cancelled.");
    await loadAppointments();
  } catch (err: unknown) {
    showToast((err as { message?: string }).message ?? "Failed to cancel appointment.", "danger");
  }
};

(window as unknown as Record<string, unknown>)["handleChangeStatus"] = (id: string) => {
  const a = appointments.find((x) => x.id === id);
  if (!a) return;
  (document.getElementById("status-apt-id") as HTMLInputElement).value = id;
  (document.getElementById("status-current") as HTMLElement).textContent = a.statusDisplay;
  // @ts-ignore
  new bootstrap.Modal(document.getElementById("status-modal")!).show();
};

async function submitStatusForm(e: SubmitEvent): Promise<void> {
  e.preventDefault();
  const id = (document.getElementById("status-apt-id") as HTMLInputElement).value;
  const newStatus = (document.getElementById("status-new-status") as HTMLSelectElement).value as AppointmentStatus;
  try {
    await api.updateAppointmentStatus(id, { newStatus });
    showToast("Status updated.");
    // @ts-ignore
    bootstrap.Modal.getInstance(document.getElementById("status-modal")!)?.hide();
    await loadAppointments();
  } catch (err: unknown) {
    showToast((err as { message?: string }).message ?? "Invalid status transition.", "warning");
  }
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

function updateDashboard(): void {
  const setText = (id: string, val: string | number) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val);
  };

  setText("dash-total-patients", patients.length);
  setText("dash-total-appointments", appointments.length);
  setText(
    "dash-confirmed",
    appointments.filter((a) => a.status === AppointmentStatus.Confirmed).length
  );
  setText(
    "dash-scheduled",
    appointments.filter((a) => a.status === AppointmentStatus.Scheduled).length
  );

  // Upcoming appointments table (scheduled or confirmed, future date)
  const tbody = document.getElementById("dash-upcoming-tbody")!;
  const upcoming = appointments
    .filter(
      (a) =>
        (a.status === AppointmentStatus.Scheduled || a.status === AppointmentStatus.Confirmed) &&
        new Date(a.scheduledAt) >= new Date()
    )
    .slice(0, 10);

  if (upcoming.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No upcoming appointments.</td></tr>`;
    return;
  }

  tbody.innerHTML = upcoming
    .map((a) => {
      const patient = patients.find((p) => p.id === a.patientId);
      return `<tr>
        <td>${patient ? escapeHtml(patient.fullName) : "—"}</td>
        <td>${escapeHtml(a.doctorName)}</td>
        <td>${formatDateTime(a.scheduledAt)}</td>
        <td>${escapeHtml(a.reason)}</td>
        <td><span class="badge ${statusBadgeClass(a.status)}">${a.statusDisplay}</span></td>
      </tr>`;
    })
    .join("");
}



function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Init ───────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Navigation
  document.querySelectorAll<HTMLElement>(".nav-link[data-section]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section!;
      showSection(section);
      if (section === "section-appointments") loadAppointments().then(updateDashboard);
      if (section === "section-patients") loadPatients().then(updateDashboard);
      if (section === "section-dashboard") updateDashboard();
    });
  });

  // Patient form
  document.getElementById("patient-form")?.addEventListener("submit", (e) => submitPatientForm(e as SubmitEvent));
  document.getElementById("btn-add-patient")?.addEventListener("click", () => openPatientModal());

  // Appointment form
  document.getElementById("appointment-form")?.addEventListener("submit", (e) => submitAppointmentForm(e as SubmitEvent));
  document.getElementById("btn-add-appointment")?.addEventListener("click", () => openAppointmentModal());

  // Status form
  document.getElementById("status-form")?.addEventListener("submit", (e) => submitStatusForm(e as SubmitEvent));

  // Default section + initial data load
  showSection("section-dashboard");
  loadPatients().then(() => loadAppointments().then(updateDashboard));
});
