import { Component, Input } from '@angular/core';
import { SubSection, FormField } from '../../services/simplified-form.service';

interface FieldRow {
  fields: FormField[];
}

@Component({
  selector: 'app-form-subsection',
  templateUrl: './form-subsection.component.html',
  styleUrls: ['./form-subsection.component.css']
})
export class FormSubSectionComponent {
  @Input() subSection!: SubSection;

  trackByField(index: number, field: FormField): number {
    return field.id;
  }

  trackByRow(index: number, row: FieldRow): number {
    return index;
  }

  getMaxColumn(): number {
    return 3; // Default to 3 columns per row like the portal
  }

  getMaxColumnForRow(fieldsInRow: number): number {
    if (fieldsInRow <= 2) {
      return 2; // Use 2 columns for 1-2 fields
    }
    return 3; // Use 3 columns for 3+ fields
  }

  getFieldRows(): FieldRow[] {
    if (!this.subSection.formFields || this.subSection.formFields.length === 0) {
      return [];
    }

    const sortedFields = [...this.subSection.formFields].sort((a, b) => a.tabIndex - b.tabIndex);
    const rows: FieldRow[] = [];
    let currentRow: FormField[] = [];
    const maxColumn = this.getMaxColumn();

    for (const field of sortedFields) {
      if (field.columnIndex === 1 || currentRow.length >= maxColumn) {
        if (currentRow.length > 0) {
          rows.push({ fields: currentRow });
        }
        currentRow = [field];
      } else {
        currentRow.push(field);
      }
    }

    if (currentRow.length > 0) {
      rows.push({ fields: currentRow });
    }

    return rows;
  }

  getFieldColumnClass(field: FormField, fieldsInRow: number = 3): string {
    let columnWidth = 4;
    
    if (fieldsInRow === 1) {
      columnWidth = 12;
    } else if (fieldsInRow === 2) {
      columnWidth = 6;
    } else if (fieldsInRow === 3) {
      columnWidth = 4;
    } else {
      columnWidth = 3;
    }
    
    if (field.type === 22) {
      return 'col-xs-12 col-sm-6';
    }
    
    return `col-xs-12 col-sm-${columnWidth}`;
  }
}
