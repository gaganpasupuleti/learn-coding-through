using HealthcareAppointment.Api.Models;

namespace HealthcareAppointment.Api.Repositories;

/// <summary>
/// Defines the data-access contract for <see cref="Patient"/> entities.
/// </summary>
public interface IPatientRepository
{
    Task<IEnumerable<Patient>> GetAllAsync();
    Task<Patient?> GetByIdAsync(Guid id);
    Task<Patient> AddAsync(Patient patient);
    Task<Patient> UpdateAsync(Patient patient);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsByEmailAsync(string email);
}
