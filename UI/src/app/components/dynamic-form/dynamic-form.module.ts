import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { RxViewModule, RxViewServiceModule } from "@rx/view/index";
import { FileService } from "../shared/services/file-services";
import { EditFieldPropertiesComponent } from "./dynamic-control/edit-field-properties/edit-field-properties.component";
import { FieldControlComponent } from "./dynamic-control/field-control/field-control.component";
import { PayrollPackComponent } from "./dynamic-control/payroll-pack/payroll-pack.component";
import { PersonalInformationComponent } from "./dynamic-control/personal-information/personal-information.component";
import { SectionRowsComponent } from "./dynamic-control/section-rows/section-rows.component";
import { TimelineComponent } from "./dynamic-control/timeline/timeline.component";
import { WorkHistoryComponent } from "./dynamic-control/work-history/work-history.component";
import { DynamicFormComponent } from "./dynamic-form.component";
import { DynamicFormService } from "./dynamic-form.service";
import { FormViewComponent } from "./form-view/form-view.component";
import { SharedModule } from "../shared/shared.module";
import { ClientInformationComponent } from "./dynamic-control/Client-Onboarding-Components/client-information/client-information.component";
import { ContactCardComponent } from "./dynamic-control/Client-Onboarding-Components/contact-card/contact-card.component";
import { InviteApplicantComponent } from './invite-applicant/invite-applicant.component';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { StagePropSidebarComponent } from './Sidebars/stage-section-prop-sidebar/stage-section-prop-sidebar.component';
import { FieldDragSidebarComponent } from './Sidebars/field-drag-sidebar/field-drag-sidebar.component';
import { GeneralDragNDropSidebarComponent } from './Sidebars/general-drag-n-drop-sidebar/general-drag-n-drop-sidebar.component';
import { FieldsetSidebarComponent } from "./Sidebars/fieldset-sidebar/fieldset-sidebar.component";
import { PayrollPackUkComponent } from './dynamic-control/payroll-pack-uk/payroll-pack-uk.component';
import { RxTableModule } from "@rx/table/index";
import { SidebarPropFormgroupComponent } from './Sidebars/sidebar-prop-formgroup/sidebar-prop-formgroup.component';
import { RxFormsModule } from "@rx/forms";
import { LocalDateFormat } from "../shared/date-format/local-date-format";
import { BackgroundCheckControlComponent } from "./dynamic-control/background-check-control/background-check-control.component";
import { BackgroundCheckService } from "./background-check.service";
import { BackgroundCheckSidebarComponent } from "./Sidebars/backgroundcheck-sidebar/backgroundcheck-sidebar.component";
import { RefereeInformationComponent } from "./dynamic-control/referee-information/referee-information.component";
import { AtsLookupService } from "./ats-lookup.service";

@NgModule({
  imports: [
    CommonModule, RxViewModule, ReactiveFormsModule, FormsModule,
    HttpClientModule, HttpModule, SharedModule, DragDropModule, RxTableModule,
    RxFormsModule
  ],
  declarations: [
    DynamicFormComponent, FormViewComponent, EditFieldPropertiesComponent,
    PersonalInformationComponent, RefereeInformationComponent, ClientInformationComponent,
    PayrollPackComponent, WorkHistoryComponent, ContactCardComponent, SectionRowsComponent,
    FieldControlComponent, BackgroundCheckControlComponent, TimelineComponent,
    InviteApplicantComponent, StagePropSidebarComponent,
    FieldDragSidebarComponent, GeneralDragNDropSidebarComponent, FieldsetSidebarComponent,
    BackgroundCheckSidebarComponent, PayrollPackUkComponent, SidebarPropFormgroupComponent,
  ],
  exports: [
    DynamicFormComponent
  ],
  providers: [
    DynamicFormService, FileService,
    LocalDateFormat, BackgroundCheckService, AtsLookupService
  ]
})

export class DynamicFormModule { }
