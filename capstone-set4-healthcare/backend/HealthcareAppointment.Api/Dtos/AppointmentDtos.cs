using HealthcareAppointment.Api.Models;

namespace HealthcareAppointment.Api.Dtos;

/// <summary>Payload for creating a new appointment.</summary>
public sealed record CreateAppointmentRequest(
    Guid PatientId,
    string DoctorName,
    DateTime ScheduledAt,
    string Reason,
    string? Notes);

/// <summary>Payload for updating an existing appointment.</summary>
public sealed record UpdateAppointmentRequest(
    string DoctorName,
    DateTime ScheduledAt,
    string Reason,
    string? Notes);

/// <summary>Payload for transitioning an appointment's status.</summary>
public sealed record UpdateAppointmentStatusRequest(AppointmentStatus NewStatus);

/// <summary>Read-only appointment response DTO.</summary>
public sealed record AppointmentResponse(
    Guid Id,
    Guid PatientId,
    string DoctorName,
    DateTime ScheduledAt,
    string Reason,
    AppointmentStatus Status,
    string StatusDisplay,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);
