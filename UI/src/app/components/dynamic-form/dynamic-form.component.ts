import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RxStorage } from "@rx/storage/index";
import { RxToast } from '@rx/view/index';
import { DynamicFormService } from "./dynamic-form.service";



@Component({
    selector: 'app-dynamic-form',
    templateUrl: './dynamic-form-component.html'
})

export class DynamicFormComponent implements OnInit {
    public isShowComponent: boolean = false
    public formId: number = 0;
    public isFormEditable: boolean = false;

    constructor(
      private storage: RxStorage,
      private dynamicFormService: DynamicFormService,
      private activatedRoute: ActivatedRoute,
      private toast: RxToast){
        this.activatedRoute.params.subscribe((t: any) => {
          if (t["formId"]) {
            let data = t["formId"].toString().replace('!!', '==').replace('!', '=');
            this.formId = Number.parseInt(atob(data));

            if (window.location.origin.toString().includes("localhost")) {
              // this.formId = t["formId"];
              if(this.storage.local.get('auth') == undefined){
                const token = prompt('Enter AuthToken');
                this.storage.local.save("auth", token );
              }
            }
          }
        });
    }


    ngOnInit(): void {
      let auth = this.storage.local.get("auth");
      if (auth) {
        if (this.formId > 0) {
          // verfiy and set for form-Edit
          this.activatedRoute.url.subscribe(t=>{
            if(t[0].path == 'form-edit')
              this.isFormEditable = true;
              this.isShowComponent = true;
          });
        }
        else {
            this.toast.show('FormId not valid', { status: 'error' })
        }
      }
    }

}
