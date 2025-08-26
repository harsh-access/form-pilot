using EditForm.Dtos;
using EditForm.Models;

namespace EditForm.Domain
{
    public class SubSectionDomain
    {
        private static DynamicForm DynamicForms => EditFormDomain.DynamicForm;
        public bool Create(int sectionId, SubSectionDto dto)
        {
            var section = GetSection(sectionId);
            if (section == null) return false;
            SubSection subSection = new SubSection
            {
                Id = EditFormDomain.IncreamentSubSectionId(),
                Title = dto.SubSectionName,
                FormFields = new List<FormField>()
            };
            
            section.SubSections.Add(subSection);
            return true;
        }

        public bool Update(int sectionId, int subSectionId, SubSectionDto dto)
        {
            var section = GetSection(sectionId);
            if (section == null) return false;

            var index = section.SubSections.FindIndex(ss => ss.Id == subSectionId);
            if (index == -1) return false;

            section.SubSections[index].Title = dto.SubSectionName;
            return true;
        }

        public bool Delete(int sectionId, int subSectionId)
        {
            var section = GetSection(sectionId);
            if (section == null) return false;

            var subSection = section.SubSections.FirstOrDefault(ss => ss.Id == subSectionId);
            if (subSection == null) return false;

            section.SubSections.Remove(subSection);
            return true;
        }

        private Section? GetSection(int sectionId) =>
            DynamicForms.Sections.FirstOrDefault(s => s.Id == sectionId);

        
    }
}
