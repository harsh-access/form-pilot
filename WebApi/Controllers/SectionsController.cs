using EditForm.Domain;
using EditForm.Dtos;
using EditForm.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EditForm.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SectionsController : ControllerBase
    {
        private readonly SectionDomain _service;

        public SectionsController(SectionDomain service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var sections = _service.GetAll();
            if (sections == null) return NotFound();
            return Ok(sections);
        }

        [HttpPost]
        public IActionResult Post([FromBody]SectionDto dto)
        {
            if (!_service.Create(dto)) return BadRequest("Form not found or Section exists.");
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{sectionId}")]
        public IActionResult Put(int sectionId, [FromBody] SectionDto dto)
        {
            if (!_service.Update(sectionId, dto)) return BadRequest("Update failed or ID mismatch.");
            return NoContent();
        }

        [HttpDelete("{sectionId}")]
        public IActionResult Delete(int sectionId)
        {
            if (!_service.Delete(sectionId)) return NotFound();
            return NoContent();
        }
    }
}
