using Microsoft.AspNetCore.Mvc;
using EditForm.Models;
using EditForm.Domain;

namespace EditForm.Controllers
{
    [Route("api/AIFoundryAPI")]
    [ApiController]
    public class AIFoundryAPIController: ControllerBase
    {
        [HttpPost("assist")]
        public async Task<IActionResult> GetAIAssistance([FromBody] AIAssistanceRequest request)
        {
            try
            {
                var response = await AIAssistanceDomain.ProcessFormAssistanceRequest(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
