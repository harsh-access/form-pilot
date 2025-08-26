import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-work-history',
  templateUrl: './work-history.component.html'
})
export class WorkHistoryComponent implements OnInit {
  date : Date = new Date()

  ngOnInit(): void {
    this.date.setDate( this.date.getDate() - 7 );
    this.date.setMonth( this.date.getMonth() - 9 );
    this.date.setFullYear( this.date.getFullYear() - 2 );
  }

}
