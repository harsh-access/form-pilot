using System;
using System.Collections;
using System.Collections.Generic;
using Azure; // Add this if not already present

public class AIProjectClient
{
    public AIProjectClient(Uri endpoint, object credential) { }
    public PersistentAgentsClient GetPersistentAgentsClient() => new PersistentAgentsClient();
}

public class PersistentAgentsClient
{
    public AdministrationClient Administration { get; } = new AdministrationClient();
    public ThreadsClient Threads { get; } = new ThreadsClient();
    public MessagesClient Messages { get; } = new MessagesClient();
    public RunsClient Runs { get; } = new RunsClient();
}

public class AdministrationClient
{
    public PersistentAgent GetAgent(string id) => new PersistentAgent { Id = id };
}

public class PersistentAgent
{
    public string Id { get; set; }
}

public class ThreadsClient
{
    public PersistentAgentThread CreateThread() => new PersistentAgentThread { Id = Guid.NewGuid().ToString() };
}

public class PersistentAgentThread
{
    public string Id { get; set; }
}

public class MessagesClient
{
    public PersistentThreadMessage CreateMessage(string threadId, MessageRole role, string content)
        => new PersistentThreadMessage
        {
            CreatedAt = DateTime.UtcNow,
            Role = role,
            ContentItems = new List<MessageContent> { new MessageTextContent { Text = content } }
        };

    public Pageable<PersistentThreadMessage> GetMessages(string threadId, ListSortOrder order)
        => new MockPageable<PersistentThreadMessage>(new List<PersistentThreadMessage>());
}

public class PersistentThreadMessage
{
    public DateTime CreatedAt { get; set; }
    public MessageRole Role { get; set; }
    public List<MessageContent> ContentItems { get; set; }
}

public class RunsClient
{
    public ThreadRun CreateRun(string threadId, string agentId) => new ThreadRun { Id = Guid.NewGuid().ToString(), Status = RunStatus.Queued };
    public ThreadRun GetRun(string threadId, string runId) => new ThreadRun { Id = runId, Status = RunStatus.Completed };
}

public class ThreadRun
{
    public string Id { get; set; }
    public RunStatus Status { get; set; }
    public RunError LastError { get; set; }
}

public class RunError
{
    public string Message { get; set; }
}

public enum RunStatus
{
    Queued,
    InProgress,
    Completed,
    Failed,
    Canceled
}

public enum MessageRole
{
    User,
    Assistant,
    System
}

public enum ListSortOrder
{
    Ascending,
    Descending
}

public abstract class MessageContent { }

public class MessageTextContent : MessageContent
{
    public string Text { get; set; }
}

public class MessageImageFileContent : MessageContent
{
    public string FileId { get; set; }
}

public class MockPageable<T> : Pageable<T>
{
    private readonly IEnumerable<T> _items;

    public MockPageable(IEnumerable<T> items)
    {
        _items = items;
    }

    public override IEnumerator<T> GetEnumerator()
    {
        return _items.GetEnumerator();
    }
}