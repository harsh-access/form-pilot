import { Component, Input } from '@angular/core';
import { DynamicForm, SubSection, Section } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-payroll-pack-uk',
  templateUrl: './payroll-pack-uk.component.html'
})
export class PayrollPackUkComponent {
  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Section;
  @Input() section !: SubSection;
  @Input() isPty: boolean = false;
}
