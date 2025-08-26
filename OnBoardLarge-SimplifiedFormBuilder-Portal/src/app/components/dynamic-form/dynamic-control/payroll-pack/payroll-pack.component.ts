import { Component, Input } from '@angular/core';
import { DynamicForm, Sections, Stages } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-payroll-pack',
  templateUrl: './payroll-pack.component.html'
})
export class PayrollPackComponent {

  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Stages;
  @Input() section !: Sections;
  @Input() isPty: boolean = false;

}
