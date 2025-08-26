import { CommonModule, TitleCasePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from "@angular/router";
import { ApplicationBroadcaster } from "@rx/core/index";
import { RxFormsModule, RxValidation } from '@rx/forms/index';
import { API_HOST_URI, APP_VERSION, RxHttp } from '@rx/http/index';
import { PermissionService, RxSecurityModule } from "@rx/security/index";
import { RxTableModule } from "@rx/table/index";
import { RxStorageModule } from '@rx/storage/index';
import { RxViewModule, RxViewServiceModule } from '@rx/view/index';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { APP_LAZY_ROUTING } from './app.lazy.routing';
import { DynamicFormModule } from './components/dynamic-form/dynamic-form.module';
import { ApplicationRequestHeaders } from "./domain/application-request-headers";
import { ApplicationResponse } from "./domain/application-response";
import { ApplicationJsonConfiguration, ApplicationService, CanActivatePage, ChangeDetectionGuard, PageAccess, UserAuthorizationService } from "./domain/authorization";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [APP_LAZY_ROUTING,
    BrowserModule,
    FormsModule,
    HttpModule, RxSecurityModule, CommonModule,
    RxFormsModule, RxViewModule, RxStorageModule, RxViewServiceModule, HttpClientModule,
    DynamicFormModule, RxTableModule
  ],
  providers: [ApplicationBroadcaster,
    {
      provide: API_HOST_URI,
      useValue: environment.production ? '/' :
        'https://appuat.onboarded.co.uk/'
        // // 'http://localhost:52993/'
        // 'https://localhost:44339/'
    }
    ,
    {
      provide: APP_VERSION,
      useValue: environment.appVersion
    },
    { provide: 'RequestHeaders', useClass: ApplicationRequestHeaders },
    { provide: 'ResponseResult', useClass: ApplicationResponse }, RxHttp,
    { provide: 'PageAccess', useClass: PageAccess },
    { provide: 'ChangeDetectionGuard', useClass: ChangeDetectionGuard },
    UserAuthorizationService,
    ApplicationJsonConfiguration,
    ApplicationService,
    CanActivatePage,
    PageAccess,
    ChangeDetectionGuard
  ],
  exports: [RouterModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
