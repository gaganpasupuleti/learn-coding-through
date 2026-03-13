namespace HealthcareAppointment.Api.Models;

/// <summary>
/// Defines the lifecycle states an appointment can be in.
/// </summary>
public enum AppointmentStatus
{
    Scheduled = 0,
    Confirmed = 1,
    Completed = 2,
    Cancelled = 3,
    NoShow = 4
}
