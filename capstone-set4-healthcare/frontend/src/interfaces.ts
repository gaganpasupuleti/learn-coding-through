/**
 * TypeScript interfaces mirroring the C# backend DTOs.
 * These ensure type-safety between the HTML/TS frontend and the .NET API.
 */

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum AppointmentStatus {
  Scheduled = "Scheduled",
  Confirmed = "Confirmed",
  Completed = "Completed",
  Cancelled = "Cancelled",
  NoShow = "NoShow",
}

// ── Patient Interfaces ────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  address?: string | null;
}

export interface UpdatePatientRequest extends CreatePatientRequest {}

// ── Appointment Interfaces ────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  scheduledAt: string; // ISO datetime string
  reason: string;
  status: AppointmentStatus;
  statusDisplay: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorName: string;
  scheduledAt: string; // ISO datetime string
  reason: string;
  notes?: string | null;
}

export interface UpdateAppointmentRequest {
  doctorName: string;
  scheduledAt: string;
  reason: string;
  notes?: string | null;
}

export interface UpdateAppointmentStatusRequest {
  newStatus: AppointmentStatus;
}

// ── API Error ─────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  [key: string]: unknown;
}
