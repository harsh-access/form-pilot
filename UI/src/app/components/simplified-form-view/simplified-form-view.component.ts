import { Component, OnInit } from '@angular/core';
import { SimplifiedFormService, Section, SubSection, FormField, DynamicForm } from '../../services/simplified-form.service';

@Component({
  selector: 'app-simplified-form-view',
  templateUrl: './simplified-form-view.component.html',
  styleUrls: ['./simplified-form-view.component.css']
})
export class SimplifiedFormViewComponent implements OnInit {
  forms: DynamicForm[] = [];
  sections: Section[] = [];
  selectedFormId: number = 1;
  activeSectionId: number = 0;
  loading = true;
  error: string | null = null;
  chatMessages: string[] = [];
  collapsedSubSections: Set<number> = new Set();

  constructor(private formService: SimplifiedFormService) {}

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.loading = true;
    this.error = null;
    
    this.formService.getForms().subscribe({
      next: (forms) => {
        this.forms = forms || [];
        this.loading = false;
        if (this.forms.length > 0) {
          this.loadForm(this.selectedFormId || this.forms[0].id);
        }
      },
      error: (error) => {
        console.error('Error loading forms:', error);
        this.error = 'Failed to load forms. Please check if the API is running.';
        this.loading = false;
      }
    });
  }

  loadForm(formId: number): void {
    this.loading = true;
    this.error = null;
    
    this.formService.getForm(formId).subscribe({
      next: (form) => {
        this.sections = form.sections || [];
        this.selectedFormId = formId;
        this.loading = false;
        if (this.sections.length > 0) {
          this.activeSectionId = this.sections[0].id;
        }
      },
      error: (error) => {
        console.error('Error loading form:', error);
        this.error = 'Failed to load form. Please check if the API is running.';
        this.loading = false;
      }
    });
  }

  loadSections(): void {
    this.loading = true;
    this.error = null;
    
    this.formService.getSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        if (this.sections.length > 0) {
          this.activeSectionId = this.sections[0].id;
        }
        this.loading = false;
        console.log('Loaded sections:', sections);
      },
      error: (error) => {
        console.error('Error loading sections:', error);
        this.error = 'Failed to load form sections. Please check if the API is running.';
        this.loading = false;
      }
    });
  }

  onSectionSelected(section: Section): void {
    this.activeSectionId = section.id;
  }

  toggleSubSectionCollapse(subSectionId: number): void {
    if (this.collapsedSubSections.has(subSectionId)) {
      this.collapsedSubSections.delete(subSectionId);
    } else {
      this.collapsedSubSections.add(subSectionId);
    }
  }

  isSubSectionCollapsed(subSectionId: number): boolean {
    return this.collapsedSubSections.has(subSectionId);
  }

  onRefresh(): void {
    this.loadSections();
  }

  trackBySubSection(index: number, subSection: SubSection): number {
    return subSection.id;
  }

  trackByFormField(index: number, formField: FormField): number {
    return formField.id;
  }

  onSectionsUpdated(newSections: Section[]): void {
    this.sections = newSections;
  }

  onChatMessage(message: string): void {
    this.chatMessages.push(message);
  }

  onFormUpdated(): void {
    this.loadForm(this.selectedFormId);
  }
}
