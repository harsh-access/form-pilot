import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { RxToast } from '@rx/view/index'; // Removed for simplified POC
import { DynamicForm, FormField } from 'src/app/view-modal/DynamicFormModel';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';

@Component({
  selector: 'app-edit-field-properties-simplified',
  template: `
    <div class="sidebar-content">
      <h4>Edit Field Properties</h4>
      <form [formGroup]="EditForm" *ngIf="EditForm">
        <div class="form-group">
          <label>Field Type</label>
          <select formControlName="type" class="form-control">
            <option [value]="11">Text Box</option>
            <option [value]="12">Date Picker</option>
            <option [value]="14">Radio Button</option>
            <option [value]="17">Multiline Text</option>
            <option [value]="18">Dropdown</option>
            <option [value]="22">File Upload</option>
            <option [value]="24">Label</option>
            <option [value]="25">Multiple Select</option>
            <option [value]="28">Switch Checkbox</option>
            <option [value]="65">Label Checkbox</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Label</label>
          <input formControlName="label" class="form-control" type="text">
        </div>
        
        <div class="form-group">
          <label>Placeholder</label>
          <input formControlName="placeholder" class="form-control" type="text">
        </div>
        
        <div class="form-group">
          <label>
            <input formControlName="required" type="checkbox"> Required
          </label>
        </div>
        
        <div class="form-group" *ngIf="showOptions">
          <label>Options (one per line)</label>
          <textarea formControlName="optionsText" class="form-control" rows="4"></textarea>
        </div>
        
        <div class="form-group">
          <label>Column Index</label>
          <select formControlName="columnIndex" class="form-control">
            <option [value]="1">1</option>
            <option [value]="2">2</option>
            <option [value]="3">3</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Tab Index</label>
          <input formControlName="tabIndex" class="form-control" type="number" min="0">
        </div>
      </form>
      
      <div class="sidebar-actions">
        <button class="btn btn-primary" (click)="saveChanges()" [disabled]="!EditForm?.valid">Save</button>
        <button class="btn btn-secondary" (click)="cancelChanges()">Cancel</button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-content {
      padding: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .sidebar-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
  `]
})
export class EditFieldPropertiesSimplifiedComponent implements OnInit {
  @Input() dynamicForm!: DynamicForm;
  @Input() field!: FormField;
  @Input() isAddField: boolean = false;
  @Output() updateFieldPropChanges = new EventEmitter<{ isSuccess: boolean, qry: object }>();

  EditForm: FormGroup;
  
  get showOptions(): boolean {
    const type = this.EditForm?.get('type')?.value;
    return type === 14 || type === 18 || type === 25; // Radio, Dropdown, Multiple Select
  }

  constructor(
    private fb: FormBuilder
  ) {
    this.EditForm = this.fb.group({
      id: [0],
      type: [11, Validators.required],
      label: ['', Validators.required],
      placeholder: [''],
      required: [false],
      optionsText: [''],
      columnIndex: [1, Validators.required],
      tabIndex: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.field && !this.isAddField) {
      this.EditForm.patchValue({
        id: this.field.id,
        type: this.field.type,
        label: this.field.label,
        placeholder: this.field.placeholder || '',
        required: this.field.required || false,
        optionsText: this.field.options ? this.field.options.join('\n') : '',
        columnIndex: this.field.columnIndex,
        tabIndex: this.field.tabIndex
      });
    }
  }

  saveChanges(): void {
    if (this.EditForm.valid) {
      const formValue = this.EditForm.value;
      const fieldData: FormField = {
        id: formValue.id,
        type: formValue.type,
        label: formValue.label,
        placeholder: formValue.placeholder,
        required: formValue.required,
        options: this.showOptions && formValue.optionsText ? 
          formValue.optionsText.split('\n').filter(opt => opt.trim()) : [],
        columnIndex: formValue.columnIndex,
        tabIndex: formValue.tabIndex
      };

      this.updateFieldPropChanges.emit({ 
        isSuccess: true, 
        qry: fieldData 
      });
      
      console.log('Field properties saved successfully');
    } else {
      console.error('Please fill in all required fields');
    }
  }

  cancelChanges(): void {
    this.updateFieldPropChanges.emit({ 
      isSuccess: false, 
      qry: {} 
    });
  }
}
