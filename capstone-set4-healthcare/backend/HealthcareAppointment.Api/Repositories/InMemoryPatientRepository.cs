using System.Collections.Concurrent;
using HealthcareAppointment.Api.Models;

namespace HealthcareAppointment.Api.Repositories;

/// <summary>
/// Thread-safe in-memory implementation of <see cref="IPatientRepository"/>.
/// Suitable for development and testing; replace with a database-backed
/// implementation in production.
/// </summary>
public sealed class InMemoryPatientRepository : IPatientRepository
{
    private readonly ConcurrentDictionary<Guid, Patient> _store = new();

    public Task<IEnumerable<Patient>> GetAllAsync()
        => Task.FromResult<IEnumerable<Patient>>(_store.Values.OrderBy(p => p.LastName).ThenBy(p => p.FirstName));

    public Task<Patient?> GetByIdAsync(Guid id)
        => Task.FromResult(_store.TryGetValue(id, out var patient) ? patient : null);

    public Task<Patient> AddAsync(Patient patient)
    {
        _store[patient.Id] = patient;
        return Task.FromResult(patient);
    }

    public Task<Patient> UpdateAsync(Patient patient)
    {
        patient.UpdatedAt = DateTime.UtcNow;
        _store[patient.Id] = patient;
        return Task.FromResult(patient);
    }

    public Task<bool> DeleteAsync(Guid id)
        => Task.FromResult(_store.TryRemove(id, out _));

    public Task<bool> ExistsByEmailAsync(string email)
        => Task.FromResult(_store.Values.Any(p =>
            string.Equals(p.Email, email, StringComparison.OrdinalIgnoreCase)));
}
