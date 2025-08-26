using EditForm.Dtos;
using EditForm.Models;

namespace EditForm.Domain
{
    public class SectionDomain
    {
        private static DynamicForm DynamicForms => EditFormDomain.DynamicForm;
        public List<Section>? GetAll()
        {
            return DynamicForms.Sections;
        }

        public bool Create(SectionDto dto)
        {
            Section section = new Section
            {
                Id = EditFormDomain.IncreamentSectionId(),
                Title = dto.SectionName,
                OrderNo = dto.OrderNo,
                SubSections = new List<SubSection>()
            };
            DynamicForms.Sections.Add(section);
            return true;
        }

        public bool Update(int sectionId, SectionDto dto)
        {
            var index = DynamicForms.Sections.FindIndex(s => s.Id == sectionId);
            if (index == -1) return false;
            DynamicForms.Sections[index].Title = dto.SectionName;
            DynamicForms.Sections[index].OrderNo = dto.OrderNo;
            return true;
        }

        public bool Delete(int sectionId)
        {
            var section = DynamicForms.Sections.FirstOrDefault(s => s.Id == sectionId);
            if (section == null) return false;

            DynamicForms.Sections.Remove(section);
            return true;
        }
    }
}
