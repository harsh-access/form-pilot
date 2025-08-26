import { Component, OnInit } from "@angular/core";
import { DynamicFormService } from "./dynamic-form.service";

@Component({
    selector: 'app-dynamic-form',
    templateUrl: './dynamic-form-component.html'
})

export class DynamicFormComponent implements OnInit {
    public isShowComponent: boolean = true; // Always show for simplified POC
    public formId: number = 1; // Default form ID for POC
    public isFormEditable: boolean = true; // Always editable for POC

    constructor(private dynamicFormService: DynamicFormService) {
    }

    ngOnInit(): void {
        this.isShowComponent = true;
    }

}
