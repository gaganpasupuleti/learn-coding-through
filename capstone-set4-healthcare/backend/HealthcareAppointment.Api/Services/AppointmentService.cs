using HealthcareAppointment.Api.Dtos;
using HealthcareAppointment.Api.Exceptions;
using HealthcareAppointment.Api.Models;
using HealthcareAppointment.Api.Repositories;

namespace HealthcareAppointment.Api.Services;

/// <summary>
/// Implements appointment management business logic including
/// double-booking prevention and status-transition validation.
/// </summary>
public sealed class AppointmentService : IAppointmentService
{
    /// <summary>
    /// Valid status transitions. Key = current status; Value = allowed next statuses.
    /// </summary>
    private static readonly IReadOnlyDictionary<AppointmentStatus, IReadOnlySet<AppointmentStatus>> AllowedTransitions =
        new Dictionary<AppointmentStatus, IReadOnlySet<AppointmentStatus>>
        {
            [AppointmentStatus.Scheduled]  = new HashSet<AppointmentStatus> { AppointmentStatus.Confirmed, AppointmentStatus.Cancelled },
            [AppointmentStatus.Confirmed]  = new HashSet<AppointmentStatus> { AppointmentStatus.Completed, AppointmentStatus.Cancelled, AppointmentStatus.NoShow },
            [AppointmentStatus.Completed]  = new HashSet<AppointmentStatus>(),
            [AppointmentStatus.Cancelled]  = new HashSet<AppointmentStatus>(),
            [AppointmentStatus.NoShow]     = new HashSet<AppointmentStatus>()
        };

    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IPatientRepository _patientRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IPatientRepository patientRepository)
    {
        _appointmentRepository = appointmentRepository;
        _patientRepository = patientRepository;
    }

    public async Task<IEnumerable<AppointmentResponse>> GetAllAppointmentsAsync()
    {
        var appointments = await _appointmentRepository.GetAllAsync();
        return appointments.Select(MapToResponse);
    }

    public async Task<IEnumerable<AppointmentResponse>> GetAppointmentsByPatientAsync(Guid patientId)
    {
        var appointments = await _appointmentRepository.GetByPatientIdAsync(patientId);
        return appointments.Select(MapToResponse);
    }

    public async Task<AppointmentResponse?> GetAppointmentByIdAsync(Guid id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        return appointment is null ? null : MapToResponse(appointment);
    }

    public async Task<AppointmentResponse> CreateAppointmentAsync(CreateAppointmentRequest request)
    {
        await EnsurePatientExistsAsync(request.PatientId);
        await EnsureNoDoubleBookingAsync(request.DoctorName, request.ScheduledAt);

        var appointment = new Appointment
        {
            PatientId = request.PatientId,
            DoctorName = request.DoctorName,
            ScheduledAt = request.ScheduledAt,
            Reason = request.Reason,
            Notes = request.Notes
        };

        var created = await _appointmentRepository.AddAsync(appointment);
        return MapToResponse(created);
    }

    public async Task<AppointmentResponse> UpdateAppointmentAsync(Guid id, UpdateAppointmentRequest request)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with ID '{id}' was not found.");

        await EnsureNoDoubleBookingAsync(request.DoctorName, request.ScheduledAt, excludeId: id);

        appointment.DoctorName = request.DoctorName;
        appointment.ScheduledAt = request.ScheduledAt;
        appointment.Reason = request.Reason;
        appointment.Notes = request.Notes;

        var updated = await _appointmentRepository.UpdateAsync(appointment);
        return MapToResponse(updated);
    }

    public async Task<AppointmentResponse> UpdateAppointmentStatusAsync(Guid id, AppointmentStatus newStatus)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with ID '{id}' was not found.");

        ValidateStatusTransition(appointment.Status, newStatus);

        appointment.Status = newStatus;

        var updated = await _appointmentRepository.UpdateAsync(appointment);
        return MapToResponse(updated);
    }

    public async Task<bool> CancelAppointmentAsync(Guid id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Appointment with ID '{id}' was not found.");

        ValidateStatusTransition(appointment.Status, AppointmentStatus.Cancelled);

        appointment.Status = AppointmentStatus.Cancelled;
        await _appointmentRepository.UpdateAsync(appointment);
        return true;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private async Task EnsurePatientExistsAsync(Guid patientId)
    {
        var patient = await _patientRepository.GetByIdAsync(patientId);
        if (patient is null)
            throw new KeyNotFoundException($"Patient with ID '{patientId}' was not found.");
    }

    private async Task EnsureNoDoubleBookingAsync(string doctorName, DateTime scheduledAt, Guid? excludeId = null)
    {
        var conflict = await _appointmentRepository.FindConflictAsync(doctorName, scheduledAt, excludeId);
        if (conflict is not null)
            throw new DoubleBookingException(doctorName, scheduledAt);
    }

    private static void ValidateStatusTransition(AppointmentStatus current, AppointmentStatus requested)
    {
        if (!AllowedTransitions.TryGetValue(current, out var allowed) || !allowed.Contains(requested))
            throw new InvalidStatusTransitionException(current, requested);
    }

    private static AppointmentResponse MapToResponse(Appointment a) => new(
        a.Id, a.PatientId, a.DoctorName, a.ScheduledAt, a.Reason,
        a.Status, a.Status.ToString(), a.Notes, a.CreatedAt, a.UpdatedAt);
}
