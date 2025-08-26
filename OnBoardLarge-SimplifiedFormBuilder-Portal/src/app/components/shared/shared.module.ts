import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YesNoPopupComponent } from './custom-control/yes-no-popup/yes-no-popup.component';
import { MessageScreenComponent } from './Screens/message-screen/message-screen.component';
import { LocalDateFormat } from './date-format/local-date-format';



@NgModule({
  imports: [CommonModule,BrowserAnimationsModule,ReactiveFormsModule],
  declarations: [YesNoPopupComponent, MessageScreenComponent, LocalDateFormat],
  exports:[YesNoPopupComponent, LocalDateFormat]
})
export class SharedModule { }
