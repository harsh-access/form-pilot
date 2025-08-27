namespace EditForm.Models
{
    public class AIAssistanceResponse
    {
        public required string Type { get; set; } // "Updated" or "Ask_User"
        public required DynamicForm PreviousData { get; set; }
        public DynamicForm? NewData { get; set; }
        public required string Summary { get; set; }
    }
}
