import {
    ValidatorFn,
    AbstractControl} from "@angular/forms";

export function requiredValidator(message?:string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        const controlValue = control.value;
        if(controlValue == 0 || (controlValue != null && controlValue != "" && controlValue != "undefined")) {
                if (String(controlValue).trim() != "")
                    return null;
                else
                    return { 'required': { controlValue: "", message: message } };
        } else
            return { 'required': { controlValue: "", message: message} };
    }
}
