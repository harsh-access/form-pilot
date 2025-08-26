namespace EditForm.Models
{
    public class SubSection
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public List<FormField> FormFields { get; set; } = new();
    }
}
