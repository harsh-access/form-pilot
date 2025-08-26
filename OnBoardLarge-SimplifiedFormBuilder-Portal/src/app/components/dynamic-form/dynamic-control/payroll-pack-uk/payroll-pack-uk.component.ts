import { Component, Input } from '@angular/core';
import { DynamicForm, Sections, Stages } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-payroll-pack-uk',
  templateUrl: './payroll-pack-uk.component.html'
})
export class PayrollPackUkComponent {
  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Stages;
  @Input() section !: Sections;
  @Input() isPty: boolean = false;
}
