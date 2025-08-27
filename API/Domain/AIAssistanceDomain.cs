using EditForm.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace EditForm.Domain
{
    public static class AIAssistanceDomain
    {
        public static async Task<AIAssistanceResponse> ProcessFormAssistanceRequest(AIAssistanceRequest request)
        {
            var content = new
            {
                prompt = request.UserPrompt,
                currentContext = request.CurrentForm
            };

            var aiPrompt = JsonSerializer.Serialize(content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            
            try
            {
                Console.WriteLine($"AI Service: Sending prompt to agent...");
                var aiMessages = await AIFoundryAPIDomain.RunAgentConversation(aiPrompt);
                Console.WriteLine($"AI Service: Received {aiMessages.Count} messages from agent");
                
                var aiResponse = aiMessages.LastOrDefault();
                
                if (!string.IsNullOrEmpty(aiResponse))
                {
                    Console.WriteLine($"AI Service: Agent response: {aiResponse}");
                    
                    var jsonMatch = Regex.Match(aiResponse, @"\{.*\}", RegexOptions.Singleline);
                    if (jsonMatch.Success)
                    {
                        var jsonResponse = jsonMatch.Value;
                        var parsedResponse = JsonSerializer.Deserialize<AIAssistanceResponse>(jsonResponse, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                        
                        if (parsedResponse != null)
                        {
                            Console.WriteLine($"AI Service: Successfully parsed response with type: {parsedResponse.Type}");
                            return parsedResponse;
                        }
                    }
                    else
                    {
                        Console.WriteLine("AI Service: No JSON found in response, using fallback");
                    }
                }
                
                return new AIAssistanceResponse
                {
                    Type = "Ask_User",
                    PreviousData = request.CurrentForm,
                    NewData = null,
                    Summary = "I couldn't understand your request. Could you please provide more specific details about what you'd like to change in the form?"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AI Processing Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return new AIAssistanceResponse
                {
                    Type = "Ask_User",
                    PreviousData = request.CurrentForm,
                    NewData = null,
                    Summary = $"I encountered an error processing your request: {ex.Message}. Please try rephrasing your request."
                };
            }
        }
    }
}
