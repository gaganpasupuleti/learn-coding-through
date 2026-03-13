using HealthcareAppointment.Api.Dtos;
using HealthcareAppointment.Api.Models;

namespace HealthcareAppointment.Api.Services;

/// <summary>
/// Defines the business-logic contract for appointment management.
/// </summary>
public interface IAppointmentService
{
    Task<IEnumerable<AppointmentResponse>> GetAllAppointmentsAsync();
    Task<IEnumerable<AppointmentResponse>> GetAppointmentsByPatientAsync(Guid patientId);
    Task<AppointmentResponse?> GetAppointmentByIdAsync(Guid id);
    Task<AppointmentResponse> CreateAppointmentAsync(CreateAppointmentRequest request);
    Task<AppointmentResponse> UpdateAppointmentAsync(Guid id, UpdateAppointmentRequest request);
    Task<AppointmentResponse> UpdateAppointmentStatusAsync(Guid id, AppointmentStatus newStatus);
    Task<bool> CancelAppointmentAsync(Guid id);
}
