import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CheckCategories } from '../../Sidebars/backgroundcheck-sidebar/backgroundcheck-propertyList-functions';

@Component({
  selector: 'app-background-check-control',
  templateUrl: './background-check-control.component.html',
  styleUrls: ['./background-check-control.component.css'],
})
export class BackgroundCheckControlComponent {
  @Input() public backgroundCheck: string;

  public CheckCategories = CheckCategories;
}
