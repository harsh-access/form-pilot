import { Component, Input, OnInit } from '@angular/core';
import { RxPopup } from '@rx/view';

@Component({
  templateUrl: './yes-no-popup.component.html',

})
export class YesNoPopupComponent implements OnInit{

  public showComponent: boolean = false;
  isDefaultButton:boolean = true;
  @Input() bodyMessage: string = undefined;
  @Input() draftMessage: string = undefined;
  @Input() noteMessage: string = undefined;
  @Input() buttonUIProps : {
    yes: {
        text: string;
        color: string;
    };
    no: {
        text: string;
        color: string;
    };
    confirm:{
      text: string;
      color: string;
    }
} = undefined;

  constructor( private popup: RxPopup){}

  ngOnInit(): void {
    if(this.buttonUIProps)
      this.isDefaultButton = false;
    this.showComponent = true;
  }

  setButtonUI() {
    if(this.buttonUIProps && this.buttonUIProps.yes && this.buttonUIProps.no)
      this.isDefaultButton = false;
  }

  onUserClick(flag:boolean=false) {
    this.popup.hide(YesNoPopupComponent, { isConfirm : flag })
  }
}
