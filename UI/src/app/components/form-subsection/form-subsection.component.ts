import { Component, Input } from '@angular/core';
import { SubSection } from '../../services/simplified-form.service';

@Component({
  selector: 'app-form-subsection',
  templateUrl: './form-subsection.component.html',
  styleUrls: ['./form-subsection.component.css']
})
export class FormSubSectionComponent {
  @Input() subSection!: SubSection;

  trackByField(index: number, field: any): number {
    return field.id;
  }
}
