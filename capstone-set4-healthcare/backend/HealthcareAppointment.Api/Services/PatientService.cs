using HealthcareAppointment.Api.Dtos;
using HealthcareAppointment.Api.Models;
using HealthcareAppointment.Api.Repositories;

namespace HealthcareAppointment.Api.Services;

/// <summary>
/// Implements patient management business logic.
/// Validates uniqueness constraints before persisting changes.
/// </summary>
public sealed class PatientService : IPatientService
{
    private readonly IPatientRepository _patientRepository;

    public PatientService(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository;
    }

    public async Task<IEnumerable<PatientResponse>> GetAllPatientsAsync()
    {
        var patients = await _patientRepository.GetAllAsync();
        return patients.Select(MapToResponse);
    }

    public async Task<PatientResponse?> GetPatientByIdAsync(Guid id)
    {
        var patient = await _patientRepository.GetByIdAsync(id);
        return patient is null ? null : MapToResponse(patient);
    }

    public async Task<PatientResponse> CreatePatientAsync(CreatePatientRequest request)
    {
        if (await _patientRepository.ExistsByEmailAsync(request.Email))
            throw new InvalidOperationException($"A patient with email '{request.Email}' already exists.");

        var patient = new Patient
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            Address = request.Address
        };

        var created = await _patientRepository.AddAsync(patient);
        return MapToResponse(created);
    }

    public async Task<PatientResponse> UpdatePatientAsync(Guid id, UpdatePatientRequest request)
    {
        var patient = await _patientRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Patient with ID '{id}' was not found.");

        // Allow the same email if it belongs to this patient; otherwise check uniqueness.
        if (!string.Equals(patient.Email, request.Email, StringComparison.OrdinalIgnoreCase)
            && await _patientRepository.ExistsByEmailAsync(request.Email))
        {
            throw new InvalidOperationException($"A patient with email '{request.Email}' already exists.");
        }

        patient.FirstName = request.FirstName;
        patient.LastName = request.LastName;
        patient.Email = request.Email;
        patient.PhoneNumber = request.PhoneNumber;
        patient.DateOfBirth = request.DateOfBirth;
        patient.Address = request.Address;

        var updated = await _patientRepository.UpdateAsync(patient);
        return MapToResponse(updated);
    }

    public async Task<bool> DeletePatientAsync(Guid id)
    {
        var exists = await _patientRepository.GetByIdAsync(id);
        if (exists is null) throw new KeyNotFoundException($"Patient with ID '{id}' was not found.");

        return await _patientRepository.DeleteAsync(id);
    }

    private static PatientResponse MapToResponse(Patient p) => new(
        p.Id, p.FirstName, p.LastName, p.FullName,
        p.Email, p.PhoneNumber, p.DateOfBirth,
        p.Address, p.CreatedAt, p.UpdatedAt);
}
