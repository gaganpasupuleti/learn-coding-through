import type {
  Appointment,
  ApiError,
  CreateAppointmentRequest,
  CreatePatientRequest,
  Patient,
  UpdateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  UpdatePatientRequest,
} from "./interfaces.js";

/**
 * Typed HTTP client that communicates with the HealthcareAppointment .NET API.
 * All methods throw an {@link ApiError} on non-2xx responses so the caller
 * can display meaningful feedback to the user.
 */
export class ClinicApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "http://localhost:5000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  // ── Patients ───────────────────────────────────────────────────────────────

  async getPatients(): Promise<Patient[]> {
    return this.get<Patient[]>("/api/patients");
  }

  async getPatient(id: string): Promise<Patient> {
    return this.get<Patient>(`/api/patients/${id}`);
  }

  async createPatient(payload: CreatePatientRequest): Promise<Patient> {
    return this.post<Patient>("/api/patients", payload);
  }

  async updatePatient(id: string, payload: UpdatePatientRequest): Promise<Patient> {
    return this.put<Patient>(`/api/patients/${id}`, payload);
  }

  async deletePatient(id: string): Promise<void> {
    return this.delete(`/api/patients/${id}`);
  }

  // ── Appointments ───────────────────────────────────────────────────────────

  async getAppointments(): Promise<Appointment[]> {
    return this.get<Appointment[]>("/api/appointments");
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return this.get<Appointment[]>(`/api/appointments/patient/${patientId}`);
  }

  async getAppointment(id: string): Promise<Appointment> {
    return this.get<Appointment>(`/api/appointments/${id}`);
  }

  async createAppointment(payload: CreateAppointmentRequest): Promise<Appointment> {
    return this.post<Appointment>("/api/appointments", payload);
  }

  async updateAppointment(id: string, payload: UpdateAppointmentRequest): Promise<Appointment> {
    return this.put<Appointment>(`/api/appointments/${id}`, payload);
  }

  async updateAppointmentStatus(id: string, payload: UpdateAppointmentStatusRequest): Promise<Appointment> {
    return this.patch<Appointment>(`/api/appointments/${id}/status`, payload);
  }

  async cancelAppointment(id: string): Promise<void> {
    return this.delete(`/api/appointments/${id}`);
  }

  // ── Private HTTP helpers ───────────────────────────────────────────────────

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    return this.handleResponse<T>(res);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  private async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  private async delete(path: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const error = await this.parseError(res);
      throw error;
    }
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.ok) {
      if (res.status === 204) return undefined as unknown as T;
      return res.json() as Promise<T>;
    }
    const error = await this.parseError(res);
    throw error;
  }

  private async parseError(res: Response): Promise<ApiError> {
    try {
      const body = await res.json();
      return { message: body.message ?? `HTTP ${res.status}`, ...body };
    } catch {
      return { message: `HTTP ${res.status} ${res.statusText}` };
    }
  }
}
