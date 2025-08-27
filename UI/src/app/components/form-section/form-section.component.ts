import { Component, Input } from '@angular/core';
import { Section } from '../../services/simplified-form.service';

@Component({
  selector: 'app-form-section',
  templateUrl: './form-section.component.html',
  styleUrls: ['./form-section.component.css']
})
export class FormSectionComponent {
  @Input() section!: Section;

  trackBySubSection(index: number, subSection: any): number {
    return subSection.id;
  }
}
