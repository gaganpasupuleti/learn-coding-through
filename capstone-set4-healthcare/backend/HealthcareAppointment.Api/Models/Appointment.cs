namespace HealthcareAppointment.Api.Models;

/// <summary>
/// Represents a scheduled appointment between a patient and a doctor.
/// </summary>
public sealed class Appointment
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required Guid PatientId { get; set; }

    public required string DoctorName { get; set; }

    public required DateTime ScheduledAt { get; set; }

    public required string Reason { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
