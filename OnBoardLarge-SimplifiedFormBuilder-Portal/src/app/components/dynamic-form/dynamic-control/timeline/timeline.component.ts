import { Component, Input } from '@angular/core';
import { applicationFormInfo } from 'src/app/view-modal/DynamicFormModel';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent {

  @Input() applicationFormInfo !: applicationFormInfo;
  date:Date = new Date();
}
