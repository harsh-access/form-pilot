import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from "@angular/router";
import { AppComponent } from './app.component';
import { SimplifiedFormViewComponent } from './components/simplified-form-view/simplified-form-view.component';
import { FormSectionComponent } from './components/form-section/form-section.component';
import { FormSubSectionComponent } from './components/form-subsection/form-subsection.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { AIAssistanceComponent } from './components/ai-assistance/ai-assistance.component';

@NgModule({
  declarations: [
    AppComponent,
    SimplifiedFormViewComponent,
    FormSectionComponent,
    FormSubSectionComponent,
    FormFieldComponent,
    AIAssistanceComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: SimplifiedFormViewComponent },
      { path: '**', redirectTo: '' }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
