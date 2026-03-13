namespace HealthcareAppointment.Api.Models;

/// <summary>
/// Represents a patient registered in the clinic system.
/// </summary>
public sealed class Patient
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string Email { get; set; }

    public required string PhoneNumber { get; set; }

    public required DateOnly DateOfBirth { get; set; }

    public string? Address { get; set; }

    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string FullName => $"{FirstName} {LastName}";
}
