import { Component, Input, OnInit } from '@angular/core';
import { RxStorage } from '@rx/storage';

@Component({
  selector: 'app-message-screen',
  templateUrl: './message-screen.component.html'
})
export class MessageScreenComponent implements OnInit{

  @Input() message:string = '';

  constructor(private storage:RxStorage){ }
  ngOnInit(): void {
    this.getMessage();
  }

  private getMessage() {
    let data = this.storage.local.get('message')
    this.message = data != undefined && data != '' ? data : '';
    console.log(data);
    this.storage.local.remove('message');
  }

  /**
      Your application form changes has been successfully updated. Thank you.
    <br>
    You can close this window now.
   */
}


