using Azure.Identity;                  // For DefaultAzureCredential
using Azure;                           // For Pageable<T>
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Azure;
using Azure.Identity;

namespace EditForm.Domain
{
    public static class AIFoundryAPIDomain
    {
        public static async Task<IReadOnlyList<PersistentThreadMessage>> RunAgentConversation(string userMessage)
        {
            var endpoint = new Uri("https://hackathon-aue-rxm.services.ai.azure.com/api/projects/104-aue-rxm-project");
            AIProjectClient projectClient = new(endpoint, new DefaultAzureCredential());

            PersistentAgentsClient agentsClient = projectClient.GetPersistentAgentsClient();

            PersistentAgent agent = agentsClient.Administration.GetAgent("asst_nKMFILut2ugrfafzKMajy3yS");

            PersistentAgentThread thread = agentsClient.Threads.CreateThread();
            Console.WriteLine($"Created thread, ID: {thread.Id}");

            PersistentThreadMessage messageResponse = agentsClient.Messages.CreateMessage(
                thread.Id,
                MessageRole.User,
                userMessage);

            ThreadRun run = agentsClient.Runs.CreateRun(
                thread.Id,
                agent.Id);

            // Poll until the run reaches a terminal status
            do
            {
                await Task.Delay(TimeSpan.FromMilliseconds(500));
                run = agentsClient.Runs.GetRun(thread.Id, run.Id);
            }
            while (run.Status == RunStatus.Queued
                || run.Status == RunStatus.InProgress);
            if (run.Status != RunStatus.Completed)
            {
                throw new InvalidOperationException($"Run failed or was canceled: {run.LastError?.Message}");
            }

            Pageable<PersistentThreadMessage> messages = agentsClient.Messages.GetMessages(thread.Id, order: ListSortOrder.Ascending);

            var result = new List<PersistentThreadMessage>();
            foreach (PersistentThreadMessage threadMessage in messages)
            {
                result.Add(threadMessage);
            }
            return result;
        }
    }
}