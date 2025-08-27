namespace EditForm.Models
{
    public class DynamicForm
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public List<Section>? Sections { get; set; }
    }
}
