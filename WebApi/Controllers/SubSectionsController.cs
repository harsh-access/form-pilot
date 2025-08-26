using EditForm.Domain;
using EditForm.Dtos;
using EditForm.Models;
using Microsoft.AspNetCore.Mvc;
using static System.Collections.Specialized.BitVector32;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace EditForm.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubSectionsController : ControllerBase
    {
        private readonly SubSectionDomain _service;

        public SubSectionsController(SubSectionDomain service)
        {
            _service = service;
        }


        [HttpPost]
        public IActionResult Post(int sectionId, [FromBody] SubSectionDto dto)
        {
            if (!_service.Create(sectionId, dto))
                return BadRequest("Section not found or SubSection exists.");
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{subSectionId}")]
        public IActionResult Put(int subSectionId, int sectionId, [FromBody] SubSectionDto dto)
        {
            if (!_service.Update(sectionId, subSectionId, dto))
                return BadRequest("Update failed or ID mismatch.");
            return NoContent();
        }

        [HttpDelete("{subSectionId}")]
        public IActionResult Delete( int sectionId, int subSectionId)
        {
            if (!_service.Delete(sectionId, subSectionId))
                return NotFound();
            return NoContent();
        }
    }
}
