using EditForm.Models;

namespace EditForm.Domain
{
    public static class EditFormDomain
    {
        public static DynamicForm DynamicForm { get; set; } = new DynamicForm()
        {
            Id = 1,
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
            },
            Title = "Test form"
        };


        public static int _formFieldId = 9;
        public static int _subSectionId = 4;
        public static int _sectionId = 3;

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

        //public static List<FormField> PersonalDetails = new()
        //{
        //   new() { Id = 1, Type = FieldTypeEnum.DropDown, ColumnIndex = 1, Label = "Title", Required = true, Options = ["Dr.","Ms.","Mrs.","Mr."], TabIndex = 1 },
        //   new() { Id = 2, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "First Name", Placeholder = "First Name", Required = true, TabIndex = 2 },
        //   new() { Id = 3, Type = FieldTypeEnum.TextBox, ColumnIndex = 1, Label = "Middle Name", Placeholder = "Middle Name", Required = true, TabIndex = 3 },
        //   new() { Id = 4, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "Last Name", Placeholder = "Last Name", Required = true , TabIndex = 4 }
        //};

        //public static List<FormField> Contact = new()
        //{
        //    new() { Id = 5, Type = FieldTypeEnum.TextBox, ColumnIndex = 1, Label = "Telephone", Required = true, TabIndex = 1 },
        //    new() { Id = 6, Type = FieldTypeEnum.TextBox, ColumnIndex = 2, Label = "Mobile", Required = false, TabIndex = 2 },
        //    new() { Id = 7, Type = FieldTypeEnum.TextBox, ColumnIndex = 3, Label = "Email", Required = false, TabIndex = 3 }
        //};

        //public static List<FormField> Identification = new()
        //{
        //    new() { Id = 8, Type = FieldTypeEnum.SingleFileUpload, ColumnIndex = 1, Label = "Identification Primary", Required = true, TabIndex = 4 }
        //};

        //public static List<SubSection> PersonalInfoSubSection = new()
        //{
        //    new() { Id = 1, Title = "PersonalDetails", FormFields = PersonalDetails },
        //    new() { Id = 2, Title = "Contact", FormFields = Contact }
        //};

        //public static List<SubSection> DocumentsSubSection = new()
        //{
        //    new() { Id = 3, Title = "Identification", FormFields = Identification }
        //};

        //public static List<Section> Sections = 

        //public static List<DynamicForm> DynamicForms = new()
        //{
        //    new() { Id = 1, Title = "Test Form", Sections = Sections }
        //};
    }
}
