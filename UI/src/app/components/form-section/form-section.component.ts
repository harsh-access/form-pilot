import { Component, Input } from '@angular/core';
import { SubSection, FormField } from '../../services/simplified-form.service';

@Component({
  selector: 'app-form-section',
  templateUrl: './form-section.component.html',
  styleUrls: ['./form-section.component.css']
})
export class FormSectionComponent {
  @Input() subSection!: SubSection;
  isCollapsed: boolean = false;

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  trackByFormField(index: number, formField: FormField): number {
    return formField.id;
  }
}
