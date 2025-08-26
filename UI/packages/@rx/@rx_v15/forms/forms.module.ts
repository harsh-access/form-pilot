import { CommonModule, CurrencyPipe, DecimalPipe } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RegularExpression } from "../core";

import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { HttpModule } from "@angular/http";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { RxHttp } from "../http";
import {
  RxControlIndexDirective,
  RxCurrencyDirective,
  RxDateComponent,
  RxDatePickerComponent,
  RxDecimalDirective,
  RxDirtyDirective,
  RxFocusDirective,
  RxMaskDirective,
  RxMessageComponent, RxMessageDirective,
  RxMobilePhoneComponent,
  RxMonthPicker,
  RxPickerComponent,
  RxPlaceholderDirective,
  RxSelectComponent,
  RxSliderControlComponent,
  RxTabindexDirective,
  RxTagComponent,
  RxTimeComponent,
  RxYearPicker,
} from './forms';
@NgModule({
  declarations: [RxPlaceholderDirective, RxTabindexDirective,
    RxFocusDirective, RxControlIndexDirective, RxMaskDirective
    , RxCurrencyDirective, RxDecimalDirective, RxDateComponent,
    RxPickerComponent,
    RxDatePickerComponent,
    RxMonthPicker,
    RxYearPicker,
    RxTimeComponent, RxTagComponent, RxMessageComponent, RxMessageDirective,
    RxSelectComponent, RxDirtyDirective, RxMobilePhoneComponent, RxSliderControlComponent
  ],
  exports: [RxPlaceholderDirective, RxTabindexDirective,
    RxCurrencyDirective, RxDecimalDirective, RxFocusDirective, RxControlIndexDirective,
    RxMaskDirective,
    RxDateComponent,
    RxPickerComponent,
    RxDatePickerComponent,
    RxMonthPicker,
    RxTimeComponent, RxTagComponent, RxMessageDirective, RxSelectComponent, RxDirtyDirective, RxMobilePhoneComponent, RxSliderControlComponent
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpModule, NgxIntlTelInputModule, NgxSliderModule],
  providers: [CurrencyPipe, DecimalPipe, RegularExpression
    , { provide: RxHttp, useClass: RxHttp }
  ],
  entryComponents: [RxMessageComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RxFormsModule {
  static forRoot() { return { ngModule: RxFormsModule, providers: [] }; }
}
