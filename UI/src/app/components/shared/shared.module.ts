import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RxViewModule } from '@rx/view/index';
import { YesNoPopupComponent } from './custom-control/yes-no-popup/yes-no-popup.component';
import { MobilephoneValidatorComponent } from './custom-control/mobilephone-validator/mobilephone-validator.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MessageScreenComponent } from './Screens/message-screen/message-screen.component';
import { LocalDateFormat } from './date-format/local-date-format';



@NgModule({
  imports: [CommonModule,RxViewModule,NgxIntlTelInputModule,BrowserAnimationsModule,ReactiveFormsModule],
  declarations: [YesNoPopupComponent, MobilephoneValidatorComponent, MessageScreenComponent, LocalDateFormat],
  exports:[YesNoPopupComponent,MobilephoneValidatorComponent, LocalDateFormat]
})
export class SharedModule { }
