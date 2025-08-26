import { Component, Input } from '@angular/core';
import { DynamicForm, Sections, Stages } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-withholding-declaration',
  templateUrl: './withholding-declaration.component.html',
  styleUrls: ['./withholding-declaration.component.css']
})
export class WithholdingDeclarationComponent {
  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Stages;
  @Input() section !: Sections;

  tfnSwitch:boolean =false;
  superSwitch:boolean =false;
  bankSwitch:boolean =false;
}
