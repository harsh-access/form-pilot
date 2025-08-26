import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR} from "@angular/forms";
import {
    PhoneNumberFormat,
    PhoneNumberType, PhoneNumberUtil
} from "google-libphonenumber";
// import '../../../../../../../node_modules/intl-tel-input/build/js/utils.js';
import * as ngxIntlTelInput from "ngx-intl-tel-input";

@Component({
    selector: 'rx-mobilephone',
    templateUrl: './rx_mobile_phone_component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RxMobilePhoneComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => RxMobilePhoneComponent), multi: true }
    ],
    styleUrls: ['./rx_mobile_phone_component.css']
})
export class RxMobilePhoneComponent implements OnInit {
    @Input() mobileNumber: any;
    @Input() applicationFormCountry: any;
    @Input() applyClass = true;
    // @Input() personalInformation: any;
    @Output() mobileNo: EventEmitter<any> = new EventEmitter<any>();
    showComponent: boolean = false;
    public countryCodes = ISOCountryCodes;
    public countryCode: string = undefined
    public phoneNumber: string = undefined
    public phoneNumberWithCode: string = undefined
    public phoneNumberUtil = PhoneNumberUtil.getInstance();
    public reCountryCode: string = undefined
    public phoneNumberFormat = PhoneNumberFormat.NATIONAL;
    public phoneNumberType = PhoneNumberType.MOBILE;
    public isValid: boolean = false;
    // public numberFormat = ngxIntlTelInput.PhoneNumberFormat.National;
    separateDialCode = false;
    public validateMobile: any;
    isSuccess: boolean = false;

    SearchCountryField = ngxIntlTelInput.SearchCountryField;
    CountryISO = ngxIntlTelInput.CountryISO;
    preferredCountries: ngxIntlTelInput.CountryISO[] = [

    ];
    phoneForm = new FormGroup({
        // phone: new FormControl(undefined, [Validators.required, this.phoneValidator])
        phone: new FormControl(undefined)
    });

    public ngOnInit(): void {
        this.setCountryCode();
        this.validateMobile = {};
        if (this.mobileNumber != null && this.mobileNumber != undefined) {
            this.phoneNumber = this.mobileNumber;
            if (this.phoneNumber.includes(')')) {
                this.mobileNumber = this.phoneNumber.replace(/\(([^()]*)\)/g, "");
            }
            else {
                this.mobileNumber = this.phoneNumber;
            }
            this.validateMobile.isValid = this.isValid;
            this.validateMobile.mobileNumber = this.mobileNumber;
            this.mobileNo.emit(this.validateMobile);
        }
        if (window.location.host.includes('uk')) {
            this.countryCode = 'GB';
        }
        else if (window.location.host.includes('au') && this.applicationFormCountry == 'NZ'){
            this.countryCode = 'NZ';
        }
        else {
            this.countryCode = 'AU';
        }
    }
    public getCountryCode() {
        this.showComponent = true;
        if (this.phoneNumber != undefined && this.phoneNumber != null) {
            if (this.phoneNumber.startsWith('+0')) {
                this.phoneNumber = this.phoneNumber.split('+')[1];
            }
            const phone = this.phoneNumberUtil.parseAndKeepRawInput(this.phoneNumber, this.countryCode);
            this.isValid = this.phoneNumberUtil.isValidNumber(phone)
            this.countryCode = this.phoneNumberUtil.getRegionCodeForNumber(phone);
            this.countryCode = this.phoneNumberUtil.getSupportedRegions().filter(x => x == this.countryCode)[0];
        }
    }

    onCountryChange(event: any): void {
        this.phoneForm.get('phone')?.setValue(null);
    }

    countryChanged($event: any) {
        try {
            if (this.validateMobile == undefined) {
                this.validateMobile = {};
            }
            if ($event != null && $event != undefined && $event != '') {
                if ($event.nationalNumber != undefined && $event.nationalNumber != '') {
                    this.phoneNumber = $event.number;
                    this.isValid = this.isValidNumber($event.countryCode, $event.e164Number)
                    // numbertype = this.phoneNumberUtil.getNumberType(phone)
                    if (!this.isValid) {
                        this.validateMobile.isValid = false;
                        this.validateMobile.mobileNumber = $event.number;
                        this.mobileNo.emit(this.validateMobile);
                    }
                    else {
                        this.validateMobile.isValid = true;
                        if (this.phoneNumber != null && this.phoneNumber != '') {
                            const phone = this.phoneNumberUtil.parseAndKeepRawInput(this.phoneNumber, $event.countryCode);
                            this.phoneNumber = this.phoneNumberUtil.format(phone, this.phoneNumberFormat);
                            this.validateMobile.mobileNumber = this.phoneNumberWithCode;
                            this.mobileNo.emit(this.validateMobile);
                        }
                    }
                }
                else if ($event.number != undefined && $event.number != '') {
                    this.validateMobile.isValid = false;
                    this.validateMobile.mobileNumber = $event.number;
                    this.mobileNo.emit(this.validateMobile);
                }
            }
            else {

                this.validateMobile.isValid = false;
                this.validateMobile.mobileNumber = this.phoneNumber;
                this.mobileNo.emit(this.validateMobile);
            }

        } catch (error) {
            console.log(error.message)

            this.validateMobile.isValid = false;
            if ($event != null && $event != undefined) {
                if ($event.number != undefined) {
                    this.validateMobile.mobileNumber = $event.number;
                }
            }
            this.mobileNo.emit(this.validateMobile);
        }
    }


    isValidNumber(value: any, number: any) {
        if (number != null && number != undefined && number != "") {
            if (value != null) {
                const phone = this.phoneNumberUtil.parseAndKeepRawInput(number, value);
                this.isValid = this.phoneNumberUtil.isValidNumber(phone)
                if (this.isValid) {
                    if (value == undefined)
                        value = this.phoneNumberUtil.getRegionCodeForNumber(phone)
                    this.phoneNumberWithCode = number;

                    // this.phoneNumberWithCode = "+" + phone.getCountryCode() + number;
                    // this.phoneNumberWithCode = "(+" + phone.getCountryCode() + ")" + number;
                }
                // else {
                //     this.countryCode = this.CountryISO.Australia.toUpperCase();
                // }
            }
        }
        else {
            this.mobileNo.emit(number);

        }
        return this.isValid;
    }

    public setCountryCode() {
        if (this.applicationFormCountry == "UK") this.applicationFormCountry = "GB"
        else if (this.applicationFormCountry != "NZ" && this.applicationFormCountry != "AU") this.applicationFormCountry = "AU"

        this.countryCode = this.applicationFormCountry;
        this.reCountryCode = this.applicationFormCountry;
        this.showComponent = true;
        this.isSuccess = true;
        this.phoneNumber = this.mobileNumber;
        if (this.phoneNumber != undefined && this.phoneNumber != null) {
            if (this.phoneNumber.startsWith('+0')) {
                this.phoneNumber = this.phoneNumber.split('+')[1];
            }
            const phone = this.phoneNumberUtil.parseAndKeepRawInput(this.phoneNumber, this.countryCode);
            this.isValid = this.phoneNumberUtil.isValidNumber(phone)
            this.countryCode = this.phoneNumberUtil.getRegionCodeForNumber(phone);
            if (this.countryCode == null || this.countryCode == undefined) {
                this.countryCode = this.phoneNumberUtil.getSupportedRegions().filter(x => x == this.reCountryCode)[0];
            }
        }
    }

    // phoneValidator(control: AbstractControl) {
    //     debugger;
    //     const phone = control.value;
    //     // Add your logic here to validate the phone number format if necessary
    //     // Example: check if it's a valid mobile number format
    //     // You can use libphonenumber-js or your own regex
    //     if (phone && phone.number && phone.isValid) {
    //         return null; // valid
    //     }
    //     return { invalidPhone: true }; // invalid
    // }
}

export const ISOCountryCodes = ["001", "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GT", "GU", "GW", "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TA", "TC", "TD", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"]
