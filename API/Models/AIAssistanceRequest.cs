using EditForm.Models;

namespace EditForm.Models
{
    public class AIAssistanceRequest
    {
        public required DynamicForm CurrentForm { get; set; }
        public required string UserPrompt { get; set; }
    }
}
