using HealthcareAppointment.Api.Dtos;

namespace HealthcareAppointment.Api.Services;

/// <summary>
/// Defines the business-logic contract for patient management.
/// </summary>
public interface IPatientService
{
    Task<IEnumerable<PatientResponse>> GetAllPatientsAsync();
    Task<PatientResponse?> GetPatientByIdAsync(Guid id);
    Task<PatientResponse> CreatePatientAsync(CreatePatientRequest request);
    Task<PatientResponse> UpdatePatientAsync(Guid id, UpdatePatientRequest request);
    Task<bool> DeletePatientAsync(Guid id);
}
