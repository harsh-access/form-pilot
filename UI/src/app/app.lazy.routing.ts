import { ModuleWithProviders } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { DynamicFormComponent } from "./components/dynamic-form/dynamic-form.component";
import { MessageScreenComponent } from "./components/shared/Screens/message-screen/message-screen.component";
const APP_LAZY_ROUTES: Routes = [
  {
    path: '', redirectTo: 'form-view/MA!!', pathMatch: 'full'
  },
  {
    path: 'form-view/:formId',
    pathMatch: 'full',
    component: DynamicFormComponent
  },
  {
    path: 'form-edit/:formId',
    pathMatch: 'full',
    component: DynamicFormComponent
  },
  {
    path: 'message',
    pathMatch: 'full',
    component: MessageScreenComponent
  }
];

export const APP_LAZY_ROUTING: ModuleWithProviders<RouterModule> = RouterModule.forRoot(APP_LAZY_ROUTES, { preloadingStrategy: PreloadAllModules, useHash: true });
