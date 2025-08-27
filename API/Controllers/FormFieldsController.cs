using EditForm.Domain;
using EditForm.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EditForm.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FormFieldsController : ControllerBase
    {
        private readonly FormFieldDomain _service;

        public FormFieldsController(FormFieldDomain service)
        {
            _service = service;
        }

        [HttpPost]
        public IActionResult Post(int sectionId, int subSectionId, [FromBody] FormField field)
        {
            if (!_service.Create(sectionId, subSectionId, field))
                return BadRequest("SubSection not found or FormField exists.");
            return CreatedAtAction(nameof(Post), new { sectionId, subSectionId, formFieldId = field.Id }, field);
        }

        [HttpPut("{formFieldId}")]
        public IActionResult Put(int sectionId, int subSectionId, int formFieldId, [FromBody] FormField field)
        {
            if (!_service.Update(sectionId, subSectionId, formFieldId, field))
                return BadRequest("Update failed or ID mismatch.");
            return NoContent();
        }

        [HttpDelete("{formFieldId}")]
        public IActionResult Delete(int sectionId, int subSectionId, int formFieldId)
        {
            if (!_service.Delete(sectionId, subSectionId, formFieldId))
                return NotFound();
            return NoContent();
        }
    }
}
