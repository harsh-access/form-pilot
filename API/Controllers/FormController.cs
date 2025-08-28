using EditForm.Domain;
using EditForm.Models;
using Microsoft.AspNetCore.Mvc;

namespace EditForm.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FormController : ControllerBase
    {
        private readonly FormDomain _service;

        public FormController(FormDomain service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAllForms()
        {
            var forms = _service.GetAllForms();
            return Ok(forms);
        }

        [HttpGet("{formId}")]
        public IActionResult GetForm(int formId)
        {
            var form = _service.GetFormById(formId);
            if (form == null) return NotFound();
            return Ok(form);
        }

        [HttpPost]
        public IActionResult CreateForm([FromBody] DynamicForm form)
        {
            if (!_service.CreateForm(form)) 
                return BadRequest("Failed to create form.");
            return CreatedAtAction(nameof(GetForm), new { formId = form.Id }, form);
        }

        [HttpPut("{formId}")]
        public IActionResult UpdateForm(int formId, [FromBody] DynamicForm form)
        {
            if (!_service.UpdateForm(formId, form)) 
                return BadRequest("Update failed or form not found.");
            return NoContent();
        }

        [HttpDelete("{formId}")]
        public IActionResult DeleteForm(int formId)
        {
            if (!_service.DeleteForm(formId)) 
                return NotFound();
            return NoContent();
        }
    }
}
