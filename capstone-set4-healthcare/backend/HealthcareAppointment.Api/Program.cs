using HealthcareAppointment.Api.Repositories;
using HealthcareAppointment.Api.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();

// CORS – allows the local HTML frontend served from the file system or dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClinicFrontend", policy =>
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5000",
                "http://127.0.0.1:5500",   // VS Code Live Server default
                "null")                     // file:// origin
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ── Dependency Injection ───────────────────────────────────────────────────────
// Repositories (singleton for in-memory store so data persists across requests)
builder.Services.AddSingleton<IPatientRepository, InMemoryPatientRepository>();
builder.Services.AddSingleton<IAppointmentRepository, InMemoryAppointmentRepository>();

// Services (scoped – new instance per HTTP request)
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

// ── Application pipeline ───────────────────────────────────────────────────────
var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("ClinicFrontend");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    service = "Healthcare Appointment API",
    version = "1.0.0",
    endpoints = new[] { "/api/patients", "/api/appointments" }
}));

app.Run();

