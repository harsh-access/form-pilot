import {
    Component, OnInit, ElementRef, Inject,
    ViewContainerRef, ComponentFactoryResolver, ComponentRef, ReflectiveInjector,

} from '@angular/core';
import { CanActivate } from "@angular/router"


import { OverlayViewHost, BackDrop } from "../../core/view/overlay_view_host";
import { ComponentType, ComponentView } from "../../core/view/view";
import { DynamicComponentContainer, ApplicationPage, ComponentCanDeactivate } from "../../core";
import { ChangeDetectionGuard } from "../../core/change-detection-guard";
import { RxPopup } from "./popup.service";
import { ValidationFailedComponent } from "./validation-failed.component";
import { UnAuthorizedAccessComponent } from "./unauthorized-access.component";
import { DOCUMENT } from '@angular/common';
const KEY_ESC: number = 27;

@Component({
    selector: 'rx-popup',
    template: '',
})
export class RxPopupComponent {
    overLayViewHost: OverlayViewHost;
    showClass: string;
    displayBlock: string;
    componentView: any;
    promiseResolve: any
    timeOutId: number;
    isPermissionChecked: boolean = false;
    currentRecord: any;
    isValidationPopup: boolean = false;
    constructor(
        @Inject(DOCUMENT) document: any,
        public viewContainerRef: ViewContainerRef,
        public componentFactoryResolver: ComponentFactoryResolver,
        public popupService: RxPopup,
        @Inject('PageAccess') private pageAccess: any,
        @Inject("ChangeDetectionGuard") private changeDetectionGuard: any
    ) {
        this.overLayViewHost = new OverlayViewHost(document);
        popupService.setComponent = this.setComponent.bind(this);
        popupService.show = this.show.bind(this);
        popupService.hide = this.hide.bind(this);
        popupService.validationFailed = this.validationFailed.bind(this);
    }

    setComponent(componentResolver: ComponentFactoryResolver): void {
        this.componentFactoryResolver = componentResolver;
    }
    validationFailed(errors: string[]): Promise<any> {
        this.isValidationPopup = true;
        return this.show(ValidationFailedComponent, { messages: errors });
    }
    show<T>(component: ComponentType<T>, params?: {
        [key: string]: any;
    }): Promise<any> {
        if (this.timeOutId)
            window.clearTimeout(this.timeOutId);
        let promise = new Promise<any>((resolve, reject) => {
            var getComponent = DynamicComponentContainer.get(component);
            if (getComponent != undefined) {
                getComponent.isPopup = true;
                var state: any = {};
                var route: any = { data: getComponent };
                if (params && route.data.keyName && params[route.data.keyName])
                    route.data[route.data.keyName] = params[route.data.keyName];
                this.currentRecord = route;
                let accessPromise = <Promise<any>>this.pageAccess.canActivate(route, state)
                accessPromise.then((result) => {
                    this.isPermissionChecked = true;
                    if (result)
                        this.showPopup(component, resolve, params);
                    else
                        this.show(UnAuthorizedAccessComponent);
                });
            } else
                this.showPopup(component, resolve, params);

        })
        return promise;
    }

    showPopup<T>(component: ComponentType<T>, resolve: any, params?: {
        [key: string]: any;
    }): void {
        this.promiseResolve = resolve;
        this.componentView = new ComponentView<T>(component, this.viewContainerRef, this.componentFactoryResolver);
        this.componentView.create(params);
        let element = this.componentView.rootNode();
        let elementClasses = ["modal", "fade"];
        if (this.isValidationPopup)
            elementClasses.push("modal-validation");
        this.overLayViewHost.createElement(elementClasses);
        this.overLayViewHost.setStyle({ 'display': 'block' });
        if (!BackDrop.isBackdrop() && !this.isValidationPopup) {
            BackDrop.create();
            document.body.classList.add("modal-open");
        }
        else
            if (this.isValidationPopup)
                BackDrop.createValidation();
        this.overLayViewHost.appendChild(element);
        element = undefined;
        this.timeOutId = window.setTimeout(() => { this.overLayViewHost.addClass("in"); this.overLayViewHost.addClass("show"); }, 100)
    }

    hide<T>(component: ComponentType<T>, jObject?: any): void {
        if (this.isPermissionChecked) {
            var canHide = <Promise<boolean>>this.changeDetectionGuard.canDeactivate(this.componentView.getComponentRef(), this.currentRecord);
            canHide.then(x => {
                if (x) {
                    this.hidePopup(component, jObject);
                    ApplicationPage.removeLast(), this.isPermissionChecked = false;
                }
            })

        } else {
            this.hidePopup(component, jObject);
        }
    }

    hidePopup(component: any, jObject?: any): void {
        if (this.timeOutId)
            window.clearTimeout(this.timeOutId);
        this.overLayViewHost.removeClass("in");
        this.overLayViewHost.setStyle({ "display": "none" }); //Added 
        this.timeOutId = window.setTimeout(() => {
            this.componentView.destroy();
            this.componentView = undefined;
            this.overLayViewHost.destroy();
            if (BackDrop.isBackdrop() && !this.isValidationPopup) {
                BackDrop.remove();
                document.body.className = document.body.className.replace("modal-open", "");
            }
            else
                if (this.isValidationPopup) {
                    BackDrop.removeValidation();
                    this.isValidationPopup = false;
                }

            this.promiseResolve(jObject);
        }, 200)
    }
}
