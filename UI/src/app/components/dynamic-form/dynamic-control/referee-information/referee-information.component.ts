import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReferenceTypeEnum } from 'src/app/Enums/ReferenceType';


@Component({
  selector: 'app-referee-information',
  templateUrl: './referee-information.component.html',
  providers: [TitleCasePipe]
})
export class RefereeInformationComponent {

  @Input() dynamicForm!: any;
  referenceType: number;
  referenceTypeEnum = ReferenceTypeEnum;
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.referenceType = this.dynamicForm.subFormType;
  }

}
