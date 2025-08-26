namespace EditForm.Models
{
    public class FormField
    {
        public int Id { get; set; }
        public FieldTypeEnum Type { get; set; }
        public string Label { get; set; }
        public string Placeholder { get; set; }
        public bool? Required { get; set; }
        public List<string> Options { get; set; } = new(); // For select, radio, checkbox
        public int ColumnIndex { get; set; } // 1 | 2 | 3
        public int TabIndex { get; set; }
    }
}
