import { Inject, Injectable, ReflectiveInjector } from "@angular/core";
import { Response } from "@angular/http";
import { Router } from "@angular/router";
import { ApplicationBroadcaster, ApplicationConfiguration } from "@rx/core/index";
import { ResponseResult } from "@rx/http/index";
import '@rx/linq/index';
import { RxStorage } from "@rx/storage/index";
import { RxSpinner, RxToast } from "@rx/view/index";
import { requestCollection } from './request-uri';
@Injectable()
export class ApplicationResponse implements ResponseResult {
    dataOperationMessage: any = {};
    storage: RxStorage;
    constructor(@Inject(RxToast) private rxToast: RxToast, @Inject(RxSpinner) private spinner: RxSpinner, @Inject(ApplicationBroadcaster) private applicationBroadcaster: ApplicationBroadcaster, @Inject(Router) private router: Router) {
        this.applicationBroadcaster.configurationSubscriber.subscribe(t => {
            this.dataOperationMessage = ApplicationConfiguration.get('dataOperation');
        })
        let injector: any = ReflectiveInjector.resolveAndCreate([RxStorage]);
        this.storage = injector.get(RxStorage);
    }

    check(response: Response, requestMethod: string, showToast: boolean): boolean {
        requestCollection.splice(0, 1);
        if (requestCollection.length == 0)
            this.spinner.hide();
        if (!this.dataOperationMessage) {
            this.dataOperationMessage = ApplicationConfiguration.get('dataOperation');
        }
        if (showToast == undefined && this.dataOperationMessage && this.dataOperationMessage[requestMethod.toLowerCase()] && (response.status == 200 || response.status == 204 || response.status == 201))
            this.rxToast.show(this.dataOperationMessage[requestMethod.toLowerCase()]);
        else if (response.status == 417 || response.status == 406 || response.status == 400 || response.status == 401) {
            this.storage.local.clearAll();
            let requestUrl = response.url.split('api/')[1].replace('/', '-').replace('?', '-')
            while (requestUrl.includes('/'))
                requestUrl = requestUrl.replace('/', '')
            while (requestUrl.includes('?'))
                requestUrl = requestUrl.replace('?', '')

            window.location.href = window.location.origin + '/#/unauthorized/' + requestMethod.toLowerCase() + '/' + response.status + '/' + requestUrl
        }
        // else {
        //     this.router.navigateByUrl("/unauthorized/" + requestMethod.toLowerCase() + '/' + response.status);
        // }
        return true;
    }

    error(message: string) {
        this.rxToast.show("Error Occured.", { status: 'error' });
    }
}
