import { Component, Input } from '@angular/core';
import { FormField } from '../../services/simplified-form.service';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css']
})
export class FormFieldComponent {
  @Input() formField!: FormField;
  @Input() maxColumn: number = 3;

  getFieldTypeDisplay(): string {
    switch (this.formField.type) {
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
      default: return `Field Type ${this.formField.type}`;
    }
  }

  getFieldIcon(): string {
    switch (this.formField.type) {
      case 11: return 'fas fa-keyboard';
      case 17: return 'fas fa-align-left';
      case 12: return 'fas fa-calendar-alt';
      case 14: return 'fas fa-dot-circle';
      case 18: return 'fas fa-chevron-down';
      case 22: return 'fas fa-upload';
      case 25: return 'fas fa-check-square';
      case 28: return 'fas fa-toggle-on';
      case 65: return 'fas fa-check';
      case 24: return 'fas fa-tag';
      default: return 'fas fa-question-circle';
    }
  }

  getCurrentColumnIndex(): number {
    if (this.maxColumn && this.maxColumn > 0) {
      return 12 / this.maxColumn;
    }
    return 4; // Default to col-sm-4 (3 columns per row)
  }

  getConditionalCSSFlag(): string {
    if (this.formField.type === 22) { // File Upload
      return 'col-sm-4';
    }
    
    return `col-xs-12 col-sm-${this.getCurrentColumnIndex()}`;
  }

  getFieldTypeString(): string {
    switch (this.formField.type) {
      case 11: return 'Text';
      case 17: return 'Textarea';
      case 12: return 'Date';
      case 14: return 'Radio';
      case 18: return 'Dropdown';
      case 22: return 'File';
      case 25: return 'Checkbox';
      case 28: return 'Switch';
      case 65: return 'Checkbox';
      case 24: return 'Label';
      default: return 'Text';
    }
  }

  showDebugInfo: boolean = false;
}
