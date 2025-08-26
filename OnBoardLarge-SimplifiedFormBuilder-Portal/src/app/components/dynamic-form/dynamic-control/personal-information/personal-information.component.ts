import { Component, Input } from '@angular/core';
import { DynamicForm } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html'
})
export class PersonalInformationComponent {
  @Input() dynamicForm!: DynamicForm;

  datePickerValue !: Date;
  isMailingAddressDifferent: boolean = false;
  salutionLookUps: any[] = [
    {
      salutionId: 161,
      salutionName: "Dr"
    },
    {
      salutionId: 157,
      salutionName: "Miss"
    },
    {
      salutionId: 158,
      salutionName: "Mr"
    },
    {
      salutionId: 159,
      salutionName: "Mrs"
    },
    {
      salutionId: 160,
      salutionName: "Ms"
    }];


  public dateOnly(event: any) {
    if (event.target.value.match('^[0-9]{2}/[0-9]{2}/[0-9]{4}$') == null)
      event.target.value = '';
  }

  onInputChange(event: any) {
    //Allow everything except digit
    const regex = /[0-9]/;  // Matches digits (0-9)
    event.target.value = event.target.value.replace(regex, '');
  }
}
