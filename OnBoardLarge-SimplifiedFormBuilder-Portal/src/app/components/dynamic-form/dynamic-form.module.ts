import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FileService } from "../shared/services/file-services";
import { FieldsetService } from "../shared/services/fieldset.service";
import { EditFieldPropertiesSimplifiedComponent } from "./dynamic-control/edit-field-properties/edit-field-properties-simplified.component";
import { FieldControlComponent } from "./dynamic-control/field-control/field-control.component";
import { SectionRowsComponent } from "./dynamic-control/section-rows/section-rows.component";
import { DynamicFormComponent } from "./dynamic-form.component";
import { DynamicFormService } from "./dynamic-form.service";
import { FormViewComponent } from "./form-view/form-view.component";
import { SharedModule } from "../shared/shared.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { StagePropSidebarComponent } from './Sidebars/stage-section-prop-sidebar/stage-section-prop-sidebar.component';
import { FieldDragSidebarComponent } from './Sidebars/field-drag-sidebar/field-drag-sidebar.component';
import { GeneralDragNDropSidebarComponent } from './Sidebars/general-drag-n-drop-sidebar/general-drag-n-drop-sidebar.component';
import { FieldsetSidebarComponent } from "./Sidebars/fieldset-sidebar/fieldset-sidebar.component";
import { SidebarPropFormgroupComponent } from './Sidebars/sidebar-prop-formgroup/sidebar-prop-formgroup.component';
import { LocalDateFormat } from "../shared/date-format/local-date-format";
import { SimplifiedFormService } from "../../services/simplified-form.service";

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, SharedModule, DragDropModule],
    declarations: [DynamicFormComponent, FormViewComponent, EditFieldPropertiesSimplifiedComponent, SectionRowsComponent, FieldControlComponent, StagePropSidebarComponent, FieldDragSidebarComponent, GeneralDragNDropSidebarComponent, FieldsetSidebarComponent, SidebarPropFormgroupComponent],
    exports: [DynamicFormComponent],
    providers: [DynamicFormService, FileService, FieldsetService, LocalDateFormat, SimplifiedFormService]

})

export class DynamicFormModule { }
