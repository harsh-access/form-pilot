import { Component, Input } from '@angular/core';
import { DynamicForm, SubSection, Section } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-payroll-pack',
  templateUrl: './payroll-pack.component.html'
})
export class PayrollPackComponent {

  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Section;
  @Input() section !: SubSection;
  @Input() isPty: boolean = false;

}
