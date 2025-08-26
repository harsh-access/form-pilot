import { Component, Input } from '@angular/core';
import { DynamicForm } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-client-information',
  templateUrl: './client-information.component.html'
})
export class ClientInformationComponent {
  @Input() dynamicForm!: DynamicForm;

  isMailingAddressDifferent: boolean = false;

}
