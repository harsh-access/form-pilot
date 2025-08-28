import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SimplifiedFormService, AIAssistanceResponse, DynamicForm } from '../../services/simplified-form.service';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat-sidebar',
  templateUrl: './ai-chat-sidebar.component.html',
  styleUrls: ['./ai-chat-sidebar.component.css']
})
export class AiChatSidebarComponent implements OnInit {
  @Input() selectedFormId: number = 1;
  @Output() formUpdated = new EventEmitter<void>();
  chatMessages: ChatMessage[] = [];
  userPrompt: string = '';
  isLoading: boolean = false;
  currentForm: DynamicForm | null = null;

  constructor(private formService: SimplifiedFormService) {}

  ngOnInit(): void {
    this.addMessage('Hello! I can help you modify your form. Just tell me what you\'d like to change.', false);
  }

  sendMessage(): void {
    if (!this.userPrompt.trim() || this.isLoading) return;

    const userMessage = this.userPrompt.trim();
    this.addMessage(userMessage, true);
    this.userPrompt = '';
    this.isLoading = true;

    this.formService.getForm(this.selectedFormId).subscribe({
      next: (form) => {
        this.currentForm = form;
        
        this.formService.getAIAssistance(this.currentForm, userMessage).subscribe({
          next: (response: AIAssistanceResponse) => {
            this.handleAIResponse(response);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('FormPilot error:', error);
            this.addMessage('Sorry, I encountered an error processing your request. Please try again.', false);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error getting current form:', error);
        this.addMessage('Sorry, I couldn\'t access the current form data. Please try again.', false);
        this.isLoading = false;
      }
    });
  }

  private handleAIResponse(response: AIAssistanceResponse): void {
    this.addMessage(response.summary, false);
    
    if (response.type === 'Updated' && response.newData) {
      this.addMessage('Form has been updated successfully! The changes are now visible in the form.', false);
      this.formUpdated.emit();
    }
  }

  private addMessage(content: string, isUser: boolean): void {
    this.chatMessages.push({
      content,
      isUser,
      timestamp: new Date()
    });
    
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}
