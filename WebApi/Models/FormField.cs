namespace EditForm.Models
{
    public class FormField
    {
        public int Id { get; set; }
        public FieldTypeEnum Type { get; set; }
        public required string Label { get; set; }
        public string? Placeholder { get; set; }
        public bool? Required { get; set; }
        public List<string>? Options { get; set; } = null;
        public int ColumnIndex { get; set; }
        public int TabIndex { get; set; }
    }
}
