import {Injectable, Inject, ReflectiveInjector } from "@angular/core"
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router"
import {Http, RequestOptions, Headers } from "@angular/http";

import { ApplicationConfiguration, ApplicationPage} from  "@rx/core/index";

import { ApplicationJsonConfiguration } from './application-json-configuration';
import { CanActivatePage } from './can-activate-page';
import { UserAuthorizationService } from './user-authorization.service';
@Injectable()
export class PageAccess implements CanActivate {
    count: number = 0;
    constructor(private appConfiguration: ApplicationJsonConfiguration, private activatePage: CanActivatePage,
        private authorizationService: UserAuthorizationService
    ) {
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {    
        let promise = new Promise<boolean>((resolve, reject) => {
            var keyName = route.data["keyName"];
            if (route.data) {
                var keyValue = undefined;
                if (route.params && route.params[keyName])
                    keyValue = route.params[keyName];
                else
                    keyValue = route.data[keyName];
                //if (keyValue != undefined) {
                //    var lockRecord = { applicationModuleId: route.data["applicationModuleId"], childModuleName: route.data["childModuleName"], mainRecordId: keyValue };
                //    this.authorizationService.checkLock(lockRecord).subscribe(t => {
                //        this.promiseListner(this.activatePage.canActivate(route, state), resolve);
                //        this.promiseListner(this.appConfiguration.canActivate(route, state), resolve);
                //    }, error => {

                //        })
                //} else {
                    this.promiseListner(this.activatePage.canActivate(route, state), resolve);
                    this.promiseListner(this.appConfiguration.canActivate(route, state), resolve);
                //}
            }

        });
               return promise;
        //let promise = new Promise<boolean>((resolve, reject) => {
        //    this.promiseListner(this.activatePage.canActivate(route, state), resolve);
        //    this.promiseListner(this.appConfiguration.canActivate(route, state), resolve);
        //});
        //return promise;
    }

    promiseListner(promise: Promise<boolean> | boolean, resolve: any) {  
        if (typeof promise === "boolean" && promise == true) this.count++;
        else if (promise === false) resolve(false);
        else
            promise.then((result) => {
                if (this.count == 1 && result == true) {
                    resolve(true);
                    this.count = 0;
                } else if (result === false) {
                    resolve(false);
                    this.count = 0;
                }  else {
                    this.count++;
                }
            })
    }
}
