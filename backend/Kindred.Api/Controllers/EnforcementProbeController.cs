using Microsoft.AspNetCore.Mvc;

namespace Kindred.Api.Controllers;

/// <summary>
/// ENFORCEMENT TEST ONLY, NEVER TO BE MERGED. An endpoint that declares no permission, to prove that
/// the security suite fails the build (criterion 10) and that the main ruleset refuses to merge a pull
/// request whose required check fails (criterion 9).
/// </summary>
[ApiController]
[Route("v1/enforcement-probe")]
public sealed class EnforcementProbeController : ControllerBase
{
    [HttpGet(Name = "getEnforcementProbe")]
    public IActionResult Get() => Ok();
}
