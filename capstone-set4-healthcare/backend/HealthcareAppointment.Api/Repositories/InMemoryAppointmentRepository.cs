using System.Collections.Concurrent;
using HealthcareAppointment.Api.Models;

namespace HealthcareAppointment.Api.Repositories;

/// <summary>
/// Thread-safe in-memory implementation of <see cref="IAppointmentRepository"/>.
/// Suitable for development and testing; replace with a database-backed
/// implementation in production.
/// </summary>
public sealed class InMemoryAppointmentRepository : IAppointmentRepository
{
    private readonly ConcurrentDictionary<Guid, Appointment> _store = new();

    public Task<IEnumerable<Appointment>> GetAllAsync()
        => Task.FromResult<IEnumerable<Appointment>>(
            _store.Values.OrderBy(a => a.ScheduledAt));

    public Task<IEnumerable<Appointment>> GetByPatientIdAsync(Guid patientId)
        => Task.FromResult<IEnumerable<Appointment>>(
            _store.Values.Where(a => a.PatientId == patientId).OrderBy(a => a.ScheduledAt));

    public Task<Appointment?> GetByIdAsync(Guid id)
        => Task.FromResult(_store.TryGetValue(id, out var appointment) ? appointment : null);

    public Task<Appointment> AddAsync(Appointment appointment)
    {
        _store[appointment.Id] = appointment;
        return Task.FromResult(appointment);
    }

    public Task<Appointment> UpdateAsync(Appointment appointment)
    {
        appointment.UpdatedAt = DateTime.UtcNow;
        _store[appointment.Id] = appointment;
        return Task.FromResult(appointment);
    }

    public Task<bool> DeleteAsync(Guid id)
        => Task.FromResult(_store.TryRemove(id, out _));

    public Task<Appointment?> FindConflictAsync(string doctorName, DateTime scheduledAt, Guid? excludeId = null)
    {
        var conflict = _store.Values.FirstOrDefault(a =>
            string.Equals(a.DoctorName, doctorName, StringComparison.OrdinalIgnoreCase) &&
            a.ScheduledAt == scheduledAt &&
            a.Status != AppointmentStatus.Cancelled &&
            a.Id != excludeId);

        return Task.FromResult(conflict);
    }
}
