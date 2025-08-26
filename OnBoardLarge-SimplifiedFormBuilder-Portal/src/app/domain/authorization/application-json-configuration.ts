import { Injectable, Inject, ReflectiveInjector } from "@angular/core"
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router"


import { ApplicationConfiguration, ApplicationPage, ApplicationBroadcaster } from "@rx/core/index";


import { ApplicationService } from './app.service';

@Injectable()
export class ApplicationJsonConfiguration {
    constructor(private applicationService: ApplicationService, private applicationBroadcaster: ApplicationBroadcaster) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {

        if (!ApplicationConfiguration.isDataExits()) {
            let promise = new Promise<boolean>((resolve, reject) => {
                ///this.applicationService.getApplicationConfiguration().subscribe(appConfiguration=> {
                this.applicationService.getConfiguration('defaultlanguage').subscribe(t => {
                    t = t.json();
                    ApplicationConfiguration.set(t);
                    //this.applicationService.getLanguages().subscribe(languages => {
                    //  ApplicationConfiguration.setLanguages(languages);
                    ApplicationPage.addOrUpdateObject('action', route.data["accessItem"]);
                    ApplicationPage.addOrUpdateObject('defaultLanguage', t.defaultLanguage);
                    this.applicationBroadcaster.configurationBroadCast(true);
                    this.getModuleContent(route.data, resolve);
                    //})
                })
                //})
            });
            return promise;
        } else {
            let promise = new Promise<boolean>((resolve, reject) => {
                //this.applicationService.getCachedKeys().subscribe(cachedKeys => {
                //  ApplicationConfiguration.setCachedKeys(cachedKeys);
                ApplicationPage.addOrUpdateObject('action', route.data["accessItem"]);
                this.getModuleContent(route.data, resolve);
                //})
            });
            return promise;
        }
    }

    getModuleContent(data: any, resolve: any): void {
        resolve(true);
        //var defaultLanguage = ApplicationConfiguration.getDefaultLanguage(); // Ishani Make one function for gettingDefault Language
        //defaultLanguage = "en";
        //var action = ApplicationPage.get("action");
        //var applicationModuleId = ApplicationPage.get("applicationModuleId");
        //this.applicationService.getModuleContents(defaultLanguage, action, data.pageName).subscribe(t => {
        //    if (data.isPopup == undefined)
        //        ApplicationPage.removeLast();
        //    ApplicationPage.addOrUpdateModuleContent(applicationModuleId, t.json());
        //    resolve(true);
        //})
    }
}
