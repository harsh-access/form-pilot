import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxPopup, RxToast } from '@rx/view';
import { DynamicFormService } from '../dynamic-form.service';
import { vOfficesLookUp } from 'src/app/view-modal/LookupModels';
import { ApiResponseModel, testApplicantModel } from 'src/app/view-modal/GeneralApiModel';
import { OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { FormTypeEnum } from 'src/app/Enums/ApplicationForm.enum';

@Component({
  selector: 'app-invite-applicant',
  templateUrl: './invite-applicant.component.html'
})
export class InviteApplicantComponent implements OnInit {

  showComponent: boolean = true;
  countryCode:string ='';
  officesLookUps:vOfficesLookUp[] =[];
  mobileNumber: any;
  constructor( private service:DynamicFormService, private toast: RxToast,private popup: RxPopup, private fb:FormBuilder) { }

  ngOnInit(): void {
      this.applicantFormGroup.controls['applicationFormId'].setValue(1);

    this.service.getOfficeLookup().subscribe(t=>{
      if(t){
        this.officesLookUps = t;
        if(this.officesLookUps.length > 0)
        this.applicantFormGroup.controls['officeId'].setValue(this.officesLookUps[0].clientOfficeId);
      }
    });
  }

  /** validation mehtods */
  public onEmailchange() {
    if (this.applicantFormGroup.value.email != null && this.applicantFormGroup.value.email != undefined) {
      this.applicantFormGroup.controls['email'].setValue(this.applicantFormGroup.value.email.trim());
    }
  }

  public numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /** applicationFormGroup */
  applicantFormGroup: FormGroup = this.fb.group({
    firstName: [null,[Validators.required,Validators.maxLength(50)]],
    lastName: [null,[Validators.required,Validators.maxLength(50)]],
    email: [null,[Validators.required,Validators.email,Validators.maxLength(50)]],
    mobile: [null,[Validators.maxLength(50)]],
    applicationFormId: [null,[Validators.required]],
    officeId: [null, [Validators.required]],
    // externalSystemId: [null],
  });

  public Save(): void {
    let applicant : testApplicantModel = this.applicantFormGroup.value;

      this.service.postTestApplicant(applicant).subscribe((t:ApiResponseModel)=>{
        if(t && t.isSuccess){
          this.toast.show(t.message);
          this.popup.hide(InviteApplicantComponent, { isSuccess : true });
        }else{
          this.toast.show(t.message ? t.message : 'Something went wrong',{status:'error'});
        }
      });
    
  }

  public close(): void {
    this.popup.hide(InviteApplicantComponent, { isSuccess : false });
  }

  public mobileNoChange($event: any) {
    //debugger;
    this.applicantFormGroup.value.mobile = $event.mobileNumber;

    if ($event.isValid == "false" || !$event.isValid) {
      if ($event.mobileNumber) {
        this.applicantFormGroup.get('mobile').setValue(null);
        this.applicantFormGroup.controls['mobile'].invalid;
        this.applicantFormGroup.setErrors({ invalid: true });
        this.applicantFormGroup.invalid;
      }
      else {
        this.applicantFormGroup.get('mobile').setValue(null);
        this.applicantFormGroup.controls['mobile'].valid;
        this.applicantFormGroup.clearValidators;
        this.applicantFormGroup.valid;
      }
    }
    else {      
      this.applicantFormGroup.controls['mobile'].valid;
      this.applicantFormGroup.controls['mobile'].setValue($event.mobileNumber);
      this.applicantFormGroup.clearValidators;
      this.applicantFormGroup.valid;
    }
  }

}

