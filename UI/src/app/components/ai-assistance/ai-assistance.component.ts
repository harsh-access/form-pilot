import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SimplifiedFormService, Section, AIAssistanceResponse } from '../../services/simplified-form.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ai-assistance',
  templateUrl: './ai-assistance.component.html',
  styleUrls: ['./ai-assistance.component.css']
})
export class AIAssistanceComponent {
  @Input() currentSections: Section[] = [];
  @Output() sectionsUpdated = new EventEmitter<Section[]>();
  @Output() chatMessage = new EventEmitter<string>();

  userPrompt = '';
  isProcessing = false;
  showPreview = false;
  previewData: any = null;
  aiResponse: AIAssistanceResponse | null = null;

  constructor(private formService: SimplifiedFormService) {}

  async submitPrompt(): Promise<void> {
    if (!this.userPrompt.trim()) return;

    this.isProcessing = true;
    this.showPreview = false;
    this.previewData = null;

    try {
      const currentForm = {
        id: 1,
        title: 'FormPilot Form',
        sections: this.currentSections
      };

      this.aiResponse = await firstValueFrom(this.formService.getAIAssistance(currentForm, this.userPrompt));

      if (this.aiResponse?.type === 'Updated') {
        this.previewData = this.aiResponse.newData;
        this.showPreview = true;
      } else if (this.aiResponse?.type === 'Ask_User') {
        this.chatMessage.emit(`FormPilot: ${this.aiResponse.summary}`);
      }
    } catch (error) {
      console.error('FormPilot error:', error);
      this.chatMessage.emit('FormPilot: Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  acceptPreview(): void {
    if (this.previewData?.sections) {
      this.sectionsUpdated.emit(this.previewData.sections);
      this.showPreview = false;
      this.previewData = null;
      this.userPrompt = '';
      this.chatMessage.emit(`FormPilot: ${this.aiResponse?.summary || 'Form updated successfully!'}`);
    }
  }

  clearPrompt(): void {
    this.userPrompt = '';
    this.showPreview = false;
    this.previewData = null;
  }

  getFieldTypeName(type: number): string {
    switch (type) {
      case 11: return 'Text Input';
      case 17: return 'Textarea';
      case 12: return 'Date Picker';
      case 14: return 'Radio Button';
      case 18: return 'Dropdown';
      case 22: return 'File Upload';
      case 25: return 'Multiple Select';
      case 28: return 'Switch';
      case 65: return 'Checkbox';
      case 24: return 'Label';
      default: return `Field Type ${type}`;
    }
  }
}
