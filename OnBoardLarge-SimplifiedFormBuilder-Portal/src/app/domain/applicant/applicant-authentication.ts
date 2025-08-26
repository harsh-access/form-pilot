import { Injectable } from '@angular/core';
import { RxStorage } from '@rx/storage/index';
import { Router } from '@angular/router';

@Injectable()
export class ApplicantAuthentication {

    constructor(private storage: RxStorage, private router: Router) {

    }

    public isApplicantLoggedIn(): boolean {
        let token = this.storage.local.get('applicantAuth');
        let finalApiKey = this.storage.local.get('finalApiKey');

        if (token != null && token != '' && finalApiKey != null && finalApiKey != '') {
            return true;
        } else {
            return false;
        }
    }

    public redirectToApplicationForm(): void {
        let token = this.storage.local.get('applicantAuth');
        let finalApiKey = this.storage.local.get('finalApiKey');

        if (token != null && token != '' && finalApiKey != null && finalApiKey != '') {
            this.router.navigateByUrl("/application-forms/view/" + finalApiKey + "/registration");
        }
    }
}