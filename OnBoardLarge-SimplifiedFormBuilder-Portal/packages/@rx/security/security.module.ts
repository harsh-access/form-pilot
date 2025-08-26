import {NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import {CommonModule} from "@angular/common";

import {
  RxAuthorizationDirective, RxPermissionDirective, RxPermissionItemDirective, RxAuthDirective
} from './security'



@NgModule({
    imports: [CommonModule],
    declarations: [
        RxPermissionItemDirective, RxPermissionDirective, RxAuthorizationDirective,RxAuthDirective
    ], exports: [RxPermissionItemDirective, RxPermissionDirective, RxAuthorizationDirective, RxAuthDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RxSecurityModule {
}
