namespace EditForm.Models
{
    public class Section
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public int OrderNo { get; set; }
        public List<SubSection> SubSections { get; set; } = new();
    }
}
