using EditForm.Models;

namespace EditForm.Domain
{
    public class FormDomain
    {
        public List<DynamicForm> GetAllForms()
        {
            return EditFormDomain.DynamicForms;
        }

        public DynamicForm? GetFormById(int formId)
        {
            return EditFormDomain.GetFormById(formId);
        }

        public bool CreateForm(DynamicForm form)
        {
            form.Id = EditFormDomain.IncrementFormId();
            form.Sections ??= new List<Section>();
            EditFormDomain.DynamicForms.Add(form);
            return true;
        }

        public bool UpdateForm(int formId, DynamicForm form)
        {
            var existingForm = EditFormDomain.GetFormById(formId);
            if (existingForm == null) return false;
            
            var index = EditFormDomain.DynamicForms.FindIndex(f => f.Id == formId);
            form.Id = formId;
            EditFormDomain.DynamicForms[index] = form;
            return true;
        }

        public bool DeleteForm(int formId)
        {
            var form = EditFormDomain.GetFormById(formId);
            if (form == null) return false;
            
            EditFormDomain.DynamicForms.Remove(form);
            return true;
        }
    }
}
