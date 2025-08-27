import { CanDeactivate, ActivatedRouteSnapshot } from "@angular/router";
import { Observable } from "rxjs";

import { ComponentCanDeactivate, ApplicationConfiguration, ApplicationBroadcaster } from "@rx/core/index";
import { RxDialog, DialogClick } from "@rx/view/index"
import { UserAuthorizationService } from './user-authorization.service';
import { Subscription } from "rxjs";
import { Injectable } from "@angular/core";
@Injectable()
export class ChangeDetectionGuard implements CanDeactivate<ComponentCanDeactivate> {
    changeDetectionEnabled: boolean = false;
    private userAuthorizationService: UserAuthorizationService
    private changeDetectionSubscription: Subscription;
    private dialog: RxDialog;
    constructor() {
        this.changeDetectionEnabled = ApplicationConfiguration.get("changeDetection")

    }

    canDeactivate(
        component: ComponentCanDeactivate,
        route: ActivatedRouteSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        let promise = new Promise<any>((resolve, reject) => {
            var isDeactivate = true;
            if (this.changeDetectionEnabled) {
                if (component.canDeactivate) {
                    var canDeactivate = component.canDeactivate();
                    if (typeof canDeactivate == "boolean") {
                        if (canDeactivate)
                            this.unLock(route, resolve);
                        else
                            this.showDialog(resolve);
                    }
                    else {
                        canDeactivate = <Observable<boolean>>canDeactivate;
                        canDeactivate.subscribe(t => {
                            if (t) {
                                this.unLock(route, resolve)
                            } else
                                this.showDialog(resolve);
                        })
                    }
                } else {
                    this.unLock(route, resolve);
                }
            } else
                resolve(true);
        });
        return promise;

    }

    private showDialog(resolve: any) {
        this.dialog.confirmation([], 'dataLost').then((dialogClick: DialogClick) => {
            resolve(dialogClick == DialogClick.PrimaryOk);
        })
    }

    private unLock(route: any, resolve: any): void {
        if (route.data) {
            var applicationModuleId = route.data["applicationModuleId"];
            var keyName = route.data["keyName"];
            var keyValue = undefined;
            if (route.params && route.params[keyName])
                keyValue = route.params[keyName];
            else
                keyValue = route.data[keyName];
            if (keyValue != undefined) {
                var data = {
                    applicationModuleId: applicationModuleId,
                    mainRecordId: keyValue,
                    childModuleName: (route.data["childModuleName"]) ? route.data["childModuleName"] : "default"
                };

                this.userAuthorizationService.unLockRecord(data).subscribe(t => {
                    resolve(true);
                })
            }
        } else {
            resolve(true);
        }
    }
}