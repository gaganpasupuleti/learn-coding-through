using HealthcareAppointment.Api.Models;

namespace HealthcareAppointment.Api.Repositories;

/// <summary>
/// Defines the data-access contract for <see cref="Appointment"/> entities.
/// </summary>
public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllAsync();
    Task<IEnumerable<Appointment>> GetByPatientIdAsync(Guid patientId);
    Task<Appointment?> GetByIdAsync(Guid id);
    Task<Appointment> AddAsync(Appointment appointment);
    Task<Appointment> UpdateAsync(Appointment appointment);
    Task<bool> DeleteAsync(Guid id);

    /// <summary>
    /// Returns any appointment for the given doctor at the exact scheduled time,
    /// optionally excluding an appointment by its ID (useful for update checks).
    /// </summary>
    Task<Appointment?> FindConflictAsync(string doctorName, DateTime scheduledAt, Guid? excludeId = null);
}
