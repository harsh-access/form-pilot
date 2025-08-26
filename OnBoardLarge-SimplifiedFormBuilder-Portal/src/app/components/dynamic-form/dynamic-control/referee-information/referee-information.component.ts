import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-referee-information',
  templateUrl: './referee-information.component.html',
  providers: [TitleCasePipe]
})
export class RefereeInformationComponent {

  @Input() dynamicForm!: any;

}
