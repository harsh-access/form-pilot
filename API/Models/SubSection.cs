namespace EditForm.Models
{
    public class SubSection
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public int OrderNo { get; set; }
        public List<FormField> FormFields { get; set; } = new();
    }
}
