using EditForm.Models;

namespace EditForm.Domain
{
    public class FormFieldDomain
    {
        private static DynamicForm DynamicForms => EditFormDomain.DynamicForm;

        public bool Create(int sectionId, int subSectionId, FormField formField)
        {
            var subSection = GetSubSection(sectionId, subSectionId);
            if (subSection == null) return false;
            formField.Id = EditFormDomain.IncreamentFormFieldId();
            subSection.FormFields.Add(formField);
            return true;
        }

        public bool Update(int sectionId, int subSectionId, int formFieldId, FormField updatedField)
        {
            var subSection = GetSubSection(sectionId, subSectionId);
            if (subSection == null) return false;

            var index = subSection.FormFields.FindIndex(ff => ff.Id == formFieldId);
            if (index == -1 || formFieldId != updatedField.Id) return false;

            subSection.FormFields[index] = updatedField;
            return true;
        }

        public bool Delete(int sectionId, int subSectionId, int formFieldId)
        {
            var subSection = GetSubSection(sectionId, subSectionId);
            if (subSection == null) return false;

            var field = subSection.FormFields.FirstOrDefault(ff => ff.Id == formFieldId);
            if (field == null) return false;

            subSection.FormFields.Remove(field);
            return true;
        }

        private SubSection? GetSubSection(int sectionId, int subSectionId) =>
            DynamicForms.Sections.FirstOrDefault(s => s.Id == sectionId)?
            .SubSections.FirstOrDefault(ss => ss.Id == subSectionId);
    }
}
