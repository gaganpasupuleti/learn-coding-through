using HealthcareAppointment.Api.Models;

namespace HealthcareAppointment.Api.Exceptions;

/// <summary>
/// Thrown when an attempt is made to transition an appointment to an
/// invalid status (e.g., completing a cancelled appointment).
/// </summary>
public sealed class InvalidStatusTransitionException : Exception
{
    public AppointmentStatus CurrentStatus { get; }
    public AppointmentStatus RequestedStatus { get; }

    public InvalidStatusTransitionException(AppointmentStatus current, AppointmentStatus requested)
        : base($"Cannot transition appointment from '{current}' to '{requested}'.")
    {
        CurrentStatus = current;
        RequestedStatus = requested;
    }
}
