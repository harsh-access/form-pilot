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
                if(response.Type == "Updated")
                {
                    if (EditFormDomain.DynamicForms.Count > 0 && response?.NewData != null)
                    {
                        EditFormDomain.DynamicForms[0] = response.NewData;
                    }
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
