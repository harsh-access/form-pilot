import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder,  Validators } from '@angular/forms';
import {
  PhoneNumberFormat,
  PhoneNumberType, PhoneNumberUtil
} from "google-libphonenumber";
import * as ngxIntlTelInput from "ngx-intl-tel-input";

@Component({
  selector: 'app-mobilephone-validator',
  templateUrl: './mobilephone-validator.component.html'
})
export class MobilephoneValidatorComponent implements OnInit {

  countryCode:string
  SearchCountryField = ngxIntlTelInput.SearchCountryField;
  CountryISO = ngxIntlTelInput.CountryISO;
  public phoneNumberUtil = PhoneNumberUtil.getInstance();
  public phoneNumberFormat = PhoneNumberFormat.NATIONAL;

  constructor(private fb:FormBuilder, private http:HttpClient){
    try {
      http.get('https://api.country.is').subscribe((t: any) => {
        if (t)
          this.countryCode = t.country;
        else this.countryCode = this.CountryISO.Australia;
        });
    } catch (err) {
      this.countryCode = this.CountryISO.Australia;
      console.log(err);
    }
  }

  ngOnInit(): void {
    // this.valueChange();
  }

  phoneForm = this.fb.group ({
    phone: ['',[Validators.required]]
  });

  onValueChange(event:any) {
    if (event != null && event != '' && event.number != null && event.number != '' && event.nationalNumber && event.nationalNumber != "") {
      const phone = this.phoneNumberUtil.parseAndKeepRawInput(event.number.toString(), event.countryCode);
      this.phoneForm.controls['phone'].setValue( this.phoneNumberUtil.format(phone, this.phoneNumberFormat));
    }
  }







}
