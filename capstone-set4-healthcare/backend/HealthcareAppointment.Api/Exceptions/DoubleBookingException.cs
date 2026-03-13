namespace HealthcareAppointment.Api.Exceptions;

/// <summary>
/// Thrown when an appointment would create a double booking
/// (same doctor at the same date/time slot).
/// </summary>
public sealed class DoubleBookingException : Exception
{
    public string DoctorName { get; }
    public DateTime ScheduledAt { get; }

    public DoubleBookingException(string doctorName, DateTime scheduledAt)
        : base($"Doctor '{doctorName}' already has an appointment at {scheduledAt:u}.")
    {
        DoctorName = doctorName;
        ScheduledAt = scheduledAt;
    }
}
