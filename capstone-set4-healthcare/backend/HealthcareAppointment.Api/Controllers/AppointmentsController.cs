using HealthcareAppointment.Api.Dtos;
using HealthcareAppointment.Api.Exceptions;
using HealthcareAppointment.Api.Models;
using HealthcareAppointment.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HealthcareAppointment.Api.Controllers;

/// <summary>
/// Manages scheduling and lifecycle of clinic appointments.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    /// <summary>Returns all appointments.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AppointmentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var appointments = await _appointmentService.GetAllAppointmentsAsync();
        return Ok(appointments);
    }

    /// <summary>Returns all appointments for a specific patient.</summary>
    [HttpGet("patient/{patientId:guid}")]
    [ProducesResponseType(typeof(IEnumerable<AppointmentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByPatient(Guid patientId)
    {
        var appointments = await _appointmentService.GetAppointmentsByPatientAsync(patientId);
        return Ok(appointments);
    }

    /// <summary>Returns a single appointment by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AppointmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var appointment = await _appointmentService.GetAppointmentByIdAsync(id);
        return appointment is null ? NotFound() : Ok(appointment);
    }

    /// <summary>Schedules a new appointment.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(AppointmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request)
    {
        try
        {
            var created = await _appointmentService.CreateAppointmentAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (DoubleBookingException ex)
        {
            return Conflict(new { message = ex.Message, doctorName = ex.DoctorName, scheduledAt = ex.ScheduledAt });
        }
    }

    /// <summary>Updates appointment details (doctor, time, reason, notes).</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AppointmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAppointmentRequest request)
    {
        try
        {
            var updated = await _appointmentService.UpdateAppointmentAsync(id, request);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (DoubleBookingException ex)
        {
            return Conflict(new { message = ex.Message, doctorName = ex.DoctorName, scheduledAt = ex.ScheduledAt });
        }
    }

    /// <summary>Transitions an appointment to a new status.</summary>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(AppointmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAppointmentStatusRequest request)
    {
        try
        {
            var updated = await _appointmentService.UpdateAppointmentStatusAsync(id, request.NewStatus);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidStatusTransitionException ex)
        {
            return UnprocessableEntity(new
            {
                message = ex.Message,
                currentStatus = ex.CurrentStatus.ToString(),
                requestedStatus = ex.RequestedStatus.ToString()
            });
        }
    }

    /// <summary>Cancels an appointment.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try
        {
            await _appointmentService.CancelAppointmentAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidStatusTransitionException ex)
        {
            return UnprocessableEntity(new
            {
                message = ex.Message,
                currentStatus = ex.CurrentStatus.ToString(),
                requestedStatus = ex.RequestedStatus.ToString()
            });
        }
    }
}
