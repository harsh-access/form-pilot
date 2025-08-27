import { Component, OnInit } from '@angular/core';
import { SimplifiedFormService, Section } from '../../services/simplified-form.service';

@Component({
  selector: 'app-simplified-form-view',
  templateUrl: './simplified-form-view.component.html',
  styleUrls: ['./simplified-form-view.component.css']
})
export class SimplifiedFormViewComponent implements OnInit {
  sections: Section[] = [];
  loading = true;
  error: string | null = null;
  chatMessages: string[] = [];

  constructor(private formService: SimplifiedFormService) {}

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.loading = true;
    this.error = null;
    
    this.formService.getSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        this.error = 'Failed to load form sections. Please check if the API is running.';
        this.loading = false;
      }
    });
  }

  onRefresh(): void {
    this.loadSections();
  }

  trackBySection(index: number, section: Section): number {
    return section.id;
  }

  onSectionsUpdated(newSections: Section[]): void {
    this.sections = newSections;
  }

  onChatMessage(message: string): void {
    this.chatMessages.push(message);
  }
}
