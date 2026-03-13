namespace HealthcareAppointment.Api.Dtos;

/// <summary>Payload for creating a new patient.</summary>
public sealed record CreatePatientRequest(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateOnly DateOfBirth,
    string? Address);

/// <summary>Payload for updating an existing patient.</summary>
public sealed record UpdatePatientRequest(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateOnly DateOfBirth,
    string? Address);

/// <summary>Read-only patient response DTO.</summary>
public sealed record PatientResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string PhoneNumber,
    DateOnly DateOfBirth,
    string? Address,
    DateTime CreatedAt,
    DateTime UpdatedAt);
