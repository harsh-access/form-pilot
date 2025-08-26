import { Injectable, Inject, ReflectiveInjector } from "@angular/core"
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"
import { Http, RequestOptions, Headers } from "@angular/http";

import { Subscription } from 'rxjs';

import { API_HOST_URI, RequestHeaders, ResponseResult } from "@rx/http/index";
import "@rx/linq/index";
import { ApplicationConfiguration, ApplicationBroadcaster, ApplicationPage } from "@rx/core/index";
import { user, UserPermissionCache } from "@rx/security/index";
import { RxStorage } from "@rx/storage/index";

import { UserAuthorizationService } from './user-authorization.service';
import { ApplicationService } from './app.service';
import { NO_AUTHENTICATION } from "../const/access-check-mode.const";


@Injectable()
export class CanActivatePage implements CanActivate {
    timeOutId: number;
    minutes: number = 1;
    private api: string = 'api/userauthorization'
    storage: RxStorage;
    configurationSubscription: Subscription;
    lastChecked: Date;
    constructor(
        private userAuthorizationService: UserAuthorizationService,
        private router: Router,
        private applicationBroadcaster: ApplicationBroadcaster) {
        if (!ApplicationConfiguration.isDataExits()) {
            this.configurationSubscription = this.applicationBroadcaster.configurationSubscriber.subscribe(t => {
                this.minutes = ApplicationConfiguration.get("authorization").cacheMinutes;
                this.configurationSubscription.unsubscribe();
            });
        } else {
            this.minutes = ApplicationConfiguration.get("authorization").cacheMinutes;
        }
        let injector: any = ReflectiveInjector.resolveAndCreate([RxStorage]);
        this.storage = injector.get(RxStorage);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | any {
        var auth = this.storage.local.get('auth');
        var isAuth = this.getCookie("isAuth") != undefined ? true : false;
        if (route.data && route.data["anonymous"] && !auth)
            return true;
        else if (route.data && route.data["anonymous"] && auth) {
            this.router.navigate(['applicants', 'search']);
            return false;
        }

        let id = 0;
        var accessCheckMode = route.data["accessCheckMode"];
        let applicationModuleId = route.data["applicationModuleId"];
        if (route.data["applicationModuleId"] && !route.data["childModuleName"]) {
            ApplicationPage.Init();
            ApplicationPage.addOrUpdateObject('applicationModuleId', route.data["applicationModuleId"]);
        }
        if (accessCheckMode == NO_AUTHENTICATION && !auth)
            return true;
        else if ((applicationModuleId == 1037) && auth)
            this.router.navigate(['applicants', 'search']);
        else if (applicationModuleId == 5104 && auth)
            return true;
        let isAppAuthorized = user.isApplicationAuthorized();
        let accessItem = route.data["accessItem"];
        if (auth && this.getCookie("requestContext")) {
            if (route.data && route.data["rolePermission"] != undefined && !route.data["rolePermission"] && auth) {
                return true;
            }
            let rootModuleId = route.data["rootModuleId"];
            let childModuleName = route.data["childModuleName"];
            if (applicationModuleId != undefined) {
                if (route.data["keyName"])
                    id = route.params ? route.params[route.data["keyName"]] : undefined;
                let promise = new Promise<boolean>((resolve, reject) => {
                    var currentUserPermission = rootModuleId == undefined ? undefined : user.permissions.where((t: any) => t.rootModuleId == rootModuleId)[0]  //Change for If Root Module Id Undefined then CurrentUserPermission is Undefined Ishani
                    var now = new Date();
                    if (this.lastChecked == undefined || this.lastChecked < now) {
                        this.userAuthorizationService.postAuthorize(
                            {
                                applicationModuleId: 0,
                                isApplicationAuthorized: isAppAuthorized,
                                id: id,
                            }
                        ).subscribe(t => {
                            let jObject = t.json();
                            let newjObject: any = {};
                            for (var col in jObject) {
                                for (var tempCol in jObject[col])
                                    newjObject[tempCol] = jObject[col][tempCol];
                            }
                            if (!isAppAuthorized) {
                                user.authorizationBroadcast(jObject);
                            }
                            this.lastChecked = this.getDate();
                            if (applicationModuleId != 0) {
                                user.applicationPermission = newjObject;
                                if (accessItem == "F") {
                                    resolve(true);
                                    return;
                                }
                                this.resolvePromise(resolve, this.checkAccess(route.data, user.applicationPermission), state.url)
                            } else {
                                this.resolvePromise(resolve, true, state.url);
                            }
                        }, error => {
                            this.resolvePromise(resolve, false, state.url);
                        })
                    }
                    else
                        this.resolvePromise(resolve, this.checkAccess(route.data, user.applicationPermission), state.url)
                });
                return promise;
            } else {
                return true;
            }
        } else {
            var isRemember = (this.getCookie("isRemember") == undefined) ? true : false;
            if (isRemember) {
                this.userAuthorizationService.postLogOut().subscribe(t => {
                    this.storage.local.clearAll();
                    window.location.href = '/';
                }, error => {
                    this.storage.local.clearAll();
                    window.location.href = '/';
                })
            }
            else {
                // if (this.getCookie("requestContext") == undefined) {
                //     this.storage.local.remove("auth");
                //     this.storage.local.remove("tauth");
                // }
                if (!isAuth) {
                    document.cookie = "isAuth=true;path=/";
                    window.location.href = state.url;
                    return true;
                }
                return true;
            }
        }
    }

    resolvePromise(resolve: any, isSuccess: boolean, url: string): void {
        if (isSuccess)
            resolve(isSuccess)
        else {

            var auth = this.storage.local.get('auth');
            var isRemember = this.getCookie("isRemember")
            var isAuth = this.getCookie("isAuth")
            if (isRemember == "true" && auth) {
                this.userAuthorizationService.postRemember({ token: auth }).subscribe(t => {
                    t = t.json();
                    // resolve(this.loginDomain.setRememberData(t, url));

                    if (t.failedLogin) {
                        //this.toast.show(t.validationMessage, { status: 'error' });
                        return false;
                    }
                    else {
                        user.data = { 'fullName': t.fullName, 'roleId': t.roleId, 'userName': t.userName, 'photoBase64': t.photoBase64, 'userId': t.userId }
                        user.permissions = [];
                        user.authorizationPermissionItem = t.modules;
                        for (var rootModuleId in t.modules) {
                            let userPermissionCache = new UserPermissionCache({ rootModuleId: parseInt(rootModuleId), permission: t.modules[rootModuleId], requestedDate: this.getDate() });
                            user.permissions.push(userPermissionCache);
                        }
                        this.timeOutId = window.setTimeout(() => {
                            this.storage.local.save('auth', t.token);
                            window.clearTimeout(this.timeOutId);
                            this.applicationBroadcaster.loginBroadCast(true);
                            window.location.href = url;
                        }, 50);
                        return true;
                    }
                });
            }
            else {
                resolve(false);
                this.storage.local.clearAll();
                window.location.href = '/';
            }
            //resolve(false);
            //this.storage.local.clearAll();
            // window.location.href = '/';
        }
    }

    checkAccess(data: any, userPermission: any): boolean {

        user.currentPermission = userPermission;
        if (userPermission[data.applicationModuleId] && !data.childModuleName) {
            user.pagePermission = userPermission[data.applicationModuleId];

            return userPermission[data.applicationModuleId][data.accessItem] != undefined && userPermission[data.applicationModuleId][data.accessItem];
        } else {

            if (data.childModuleName) {
                var applicationModuleId = ApplicationPage.get("applicationModuleId");
                //var childModuleName = data.childModuleName.replace("-", "");
                var childModuleName = data.childModuleName;//.replace("-", "");
                if (applicationModuleId == 7 && childModuleName == 'project-scopes')
                    childModuleName = 'client-scopes';
                return userPermission[applicationModuleId] && userPermission[applicationModuleId][childModuleName][data.accessItem] != undefined && userPermission[applicationModuleId][childModuleName][data.accessItem];
            }
        }
        return false;
    }

    getDate(): Date {
        let now = new Date();
        return new Date(now.getTime() + this.minutes * 60000)
    }

    getCookie(cname: string): string | undefined {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return undefined;
    }
}



