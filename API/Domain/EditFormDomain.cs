using EditForm.Models;

namespace EditForm.Domain
{
    public static class EditFormDomain
    {
        public static List<DynamicForm> DynamicForms { get; set; } = new List<DynamicForm>
        {
            new DynamicForm()
            {
                Id = 1,
                Title = "Employee Onboarding Form",
                Sections = new List<Section>
                {
                    new()
                    { 
                        Id = 1, 
                        Title = "Personal Information", 
                        OrderNo = 1,
                        SubSections = new()
                        {
                            new() 
                            { 
                                Id = 1, 
                                Title = "PersonalDetails", 
                                OrderNo = 1,
                                FormFields = new()
                                {
                                   new() { Id = 1, Type = FieldTypeEnum.DropDown, ColumnIndex = 1, Label = "Title", Required = true, Options = ["Dr.","Ms.","Mrs.","Mr."], TabIndex = 1 },
                                   new() { Id = 2, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "First Name", Placeholder = "First Name", Required = true, TabIndex = 2 },
                                   new() { Id = 3, Type = FieldTypeEnum.TextBox, ColumnIndex = 1, Label = "Middle Name", Placeholder = "Middle Name", Required = true, TabIndex = 3 },
                                   new() { Id = 4, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "Last Name", Placeholder = "Last Name", Required = true , TabIndex = 4 }
                                } 
                            },
                            new() 
                            { 
                                Id = 2, 
                                Title = "Contact",
                                OrderNo = 2,
                                FormFields = new()
                                {
                                    new() { Id = 5, Type = FieldTypeEnum.TextBox, ColumnIndex = 1, Label = "Telephone", Required = true, TabIndex = 1 },
                                    new() { Id = 6, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "Mobile", Required = false, TabIndex = 2 },
                                    new() { Id = 7, Type = FieldTypeEnum.TextBox, ColumnIndex = 3, Label = "Email", Required = false, TabIndex = 3 }
                                } 
                            }
                        } 
                    },
                    new()
                    { 
                        Id = 2, 
                        Title = "Documents", 
                        OrderNo = 2,
                        SubSections = new()
                        {
                            new() { 
                                Id = 3, 
                                Title = "Identification", 
                                OrderNo = 1,
                                FormFields = new()
                                {
                                    new() { Id = 8, Type = FieldTypeEnum.SingleFileUpload, ColumnIndex = 1, Label = "Identification Primary", Required = true, TabIndex = 4 }
                                } 
                            }
                        } 
                    }
                }
            },
            new DynamicForm()
            {
                Id = 2,
                Title = "Client Registration Form",
                Sections = new List<Section>
                {
                    new()
                    { 
                        Id = 3, 
                        Title = "Company Information", 
                        OrderNo = 1,
                        SubSections = new()
                        {
                            new() 
                            { 
                                Id = 4, 
                                Title = "Basic Details", 
                                OrderNo = 1,
                                FormFields = new()
                                {
                                   new() { Id = 9, Type = FieldTypeEnum.TextBox, ColumnIndex = 1, Label = "Company Name", Placeholder = "Enter company name", Required = true, TabIndex = 1 },
                                   new() { Id = 10, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "Registration Number", Placeholder = "Company registration number", Required = true, TabIndex = 2 },
                                   new() { Id = 11, Type = FieldTypeEnum.DropDown, ColumnIndex = 1, Label = "Industry", Required = true, Options = ["Technology","Finance","Healthcare","Manufacturing","Other"], TabIndex = 3 }
                                } 
                            }
                        } 
                    },
                    new()
                    { 
                        Id = 4, 
                        Title = "Contact Details", 
                        OrderNo = 2,
                        SubSections = new()
                        {
                            new() { 
                                Id = 5, 
                                Title = "Primary Contact", 
                                OrderNo = 1,
                                FormFields = new()
                                {
                                    new() { Id = 12, Type = FieldTypeEnum.TextBox, ColumnIndex = 1, Label = "Contact Person", Placeholder = "Full name", Required = true, TabIndex = 1 },
                                    new() { Id = 13, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "Email Address", Placeholder = "contact@company.com", Required = true, TabIndex = 2 },
                                    new() { Id = 14, Type = FieldTypeEnum.TextBox, ColumnIndex = 3, Label = "Phone Number", Placeholder = "+1234567890", Required = true, TabIndex = 3 }
                                } 
                            }
                        } 
                    }
                }
            }
        };

        public static DynamicForm DynamicForm => DynamicForms.FirstOrDefault() ?? new DynamicForm { Id = 1, Title = "Default Form", Sections = new List<Section>() };


        public static int _formFieldId = 15;
        public static int _subSectionId = 6;
        public static int _sectionId = 5;
        public static int _formId = 3;

        public static int IncreamentSubSectionId()
        {
            return _subSectionId++;
        }
        public static int IncreamentFormFieldId()
        {
            return _formFieldId++;
        }
        public static int IncreamentSectionId()
        {
            return _sectionId++;
        }

        public static int IncrementFormId()
        {
            return _formId++;
        }

        public static DynamicForm? GetFormById(int formId)
        {
            return DynamicForms.FirstOrDefault(f => f.Id == formId);
        }
    }
}
