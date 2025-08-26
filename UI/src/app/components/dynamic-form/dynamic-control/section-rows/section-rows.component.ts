import { ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { YesNoPopupComponent } from 'src/app/components/shared/custom-control/yes-no-popup/yes-no-popup.component';
import { DynamicForm, Section, SubSection, FormField, Columns, Rows, Sections, Stages } from 'src/app/view-modal/DynamicFormModel';
import { getControlCategoryList, IControlCategory } from '../dynamic-common-data/control-category-function';
import { crudChangeObj } from '../dynamic-common-data/crud-changes';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { OnboardedObjectTypes } from '../../Sidebars/fieldset-sidebar/fieldset-propertyList-functions';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';

@Component({
  selector: 'app-section-rows',
  templateUrl: './section-rows.component.html'
})
export class SectionRowsComponent implements OnInit {


  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Stages;
  @Input() section !: Sections;
  @Input() isEditable: boolean = false;
  @Input() dependentFieldArr: any[] = [];
  @Input() editableFieldId: number = -1;
  @Input() editableCheckId: number = -1;
  @Output() addNewSection = new EventEmitter();
  @Output() updateDynamicForm = new EventEmitter<DynamicForm>();
  @Output() updateForm = new EventEmitter<{ caseId: number, data?: any | any[] }>();
  @Output() updateEditSettings = new EventEmitter<{ formFieldId: number }>();
  @Output() updateCheckSettings = new EventEmitter<{ checkId: number }>();

  formProps = {};

  // restricted Lists
  resrictedFieldsList: string[] = ['GeneralDocuments', 'RighttoWorkLabel4', 'isWTHSwitch2'];

  isShowComponent: boolean = false;
  isAddFieldSidebar: boolean = false;

  dndEnabledIdForSectionFields: number = -1;
  isFieldsetSidebar: boolean = false;

  currentDnDModelId: number = -1;
  isVideoSection: boolean = false;
  videoSafePath: SafeResourceUrl = null;

  isUBCSection: boolean = false; // Universal Background Check
  isSupportUser: boolean = false;

  refColumnList: Array<Columns> = [];
  isEditPropWindowVisible: boolean = false;
  selectedEditField !: Columns;
  showInStart: boolean = false;
  formFieldIdsList: Array<number> = [];
  fieldTypeList: IControlCategory[];
  isAddFieldsetSidebar: boolean = false;
  fieldsetCategory: number = 0;
  isInProjectClient: boolean = false;

  constructor(
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
  }

  async ngOnInit() {
    this.generalPreparationMethod();
    this.checkForVideoSection();
    this.isSupportUser = this.checkSupportUser();

    (this.section.sectionKeyName == 'ONBD-Background-Checks') ? this.isUBCSection = true : this.isUBCSection = false;
    if (this.isUBCSection) {
    }

    this.isInProjectClient = this.dynamicForm.isInProjectClient;
    this.isShowComponent = true;
  }

  checkSupportUser(): boolean {
    // // Check if the application is running locally
    if (window.location.origin.includes("localhost")) {
      return true;
    }

    // Retrieve data from localStorage
    const storedData = localStorage.getItem('data');

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const username = parsedData?.data?.['userName'];
      // Validate if the username matches support user criteria
      if (
        username &&
        (username.startsWith("supportlogin+") ||
          username.endsWith("@onboarded.com.au") ||
          username.endsWith("@radixweb.com"))
      ) {
        return true;
      }
    }

    return false; // Default return for non-support users or missing data
  }

  IsRecruiterSection() {
    return typeof this.stage.stageName === "string" && this.stage.stageName.includes("Recruiter")
  }

  checkForVideoSection() {
    this.isVideoSection = this.section.videos && this.section.videos.length > 0;
    if (this.isVideoSection) {
      this.videoSafePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.section.videos[0].videoPath);
      let counter = 1;
      this.section.rows.forEach(row => {
        row.columns.forEach(col => {
          if (col.videoId > 0) {
            col.videoIndCtr = counter;
            counter++;
          }
        });
      });
    }
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  /** Template Methods  **/

  addNewSectionAction() {
    if (this.IsRecruiterSection()) {
      console.log('You cannot perform this operation in this section.');
      return;
    }
    this.addNewSection.emit(this.stage.formStageId);
  }


  addFieldsetAction(category: number) {
    if (this.IsRecruiterSection()) {
      console.log('You cannot perform this operation in this section.');
      return;
    }
    this.fieldsetCategory = category;
    this.isFieldsetSidebar = true;
    this.isAddFieldsetSidebar = true;
    this.selectedEditField = undefined
  }

  isDependentField(field: Columns) {

    if (field.dependentFormFieldColumns.length < 1) return true;

    let dependencyInfo = field.dependentFormFieldColumns[0];
    let refField = this.refColumnList.find(x => x.formFieldId == dependencyInfo.refFormFieldId)

    if (!this.isDependentField(refField)) {
      field.isHide = true;
      return false;
    };

    switch (true) {
      case (dependencyInfo.refValue == refField?.value && dependencyInfo.action == 'Show'):
        field.isHide = false;
        return true;
        break;
      case (dependencyInfo.refValue != refField?.value && dependencyInfo.action == 'Hide'):
        field.isHide = false;
        return true;
        break;
      default:
        field.isHide = true;
        return false;
        break;
    }
  }

  getHiddenClass(row: Rows) {
    return row.columns.filter(x => x.isHide != true).length > 0 ? ' ' : 'd-none'
  }

  addFieldAction(controltype: string) {
    if (this.IsRecruiterSection() && controltype != "ClientReport") {
      console.log('You cannot perform this operation in this section.');
      return;
    }

    let field = this.prepareFieldObject(controltype);
    this.anyControlSpecificSetup(field);

    if (controltype == "ClientReport") {
      field.fieldClass = 'd-none';
      field.labelName = 'Report Name';
    }

    this.AddFieldInTemplate(field);
    // this.setAddMainChanges(field);
    console.log("onADD", crudChangeObj["ADD"]);
    // this.editableFieldId = field.formFieldId;

    if (controltype != "ClientReport") {
      this.updateEditSettings.emit({ formFieldId: field.formFieldId })
    }


    this.isAddFieldSidebar = true;
    this.selectedEditField = field;
    this.isEditPropWindowVisible = true;
  }

  editPropAction(field: Columns) {
    let obj = this.fieldTypeList.find(x => x.controls.includes(field.controlType));
    if (obj == null || !obj) {
      console.log('Sorry! you cannot edit this field');
      return;
    }

    this.selectedEditField = field;

    if (field.objectType == OnboardedObjectTypes.licencename) {
      this.isFieldsetSidebar = true;
      this.isAddFieldsetSidebar = false;
      this.fieldsetCategory = 1;
      return;
    }

    this.isEditPropWindowVisible = true;
  }


  deleteCheckAction(id: number) {
    console.log('Background check functionality not available in simplified POC');
  }

  deleteFieldAction(id: number) {
    console.log('Delete field confirmation - simplified POC');
    const fieldId = id;
    let rows =
      this.dynamicForm.stages
        .find(s => s.formStageId == this.stage.formStageId).sections
        .find(sc => sc.formSectionId == this.section.formSectionId).rows

    let colList = rows.find(r => r.columns.find(c => c.formFieldId == fieldId)).columns

    const idx = colList.findIndex(cl => cl.formFieldId == fieldId);
    if (idx != -1) {
      colList.splice(idx, 1);

      // manage columnIdx rest of the field, which placed after removed field in the same column array
      for (let i = idx; i < colList.length; i++) {
        colList[i].columnIndex = colList[i].columnIndex - 1;
        this.setUpdateMainChanges(colList[i], ["columnIndex"]);
      }

      // remove columnsArr if there any field not exists
      if (colList.length < 1)
        rows.splice(this.section.rows.length - 1, 1)
    }

    this.updateDynamicForm.emit(this.dynamicForm);
    this.setDeleteMainChanges(fieldId);

    // this.editableFieldId = -1;
    this.updateEditSettings.emit({ formFieldId: -1 })
  }

  /** Template Methods Ended Here */

  /*** Child emit Methods */
  retriveUpdatesForDependent(updatedField: any) {
    let field = this.getColumnFromDynamicForm(updatedField.formFieldId)
    let refCol = this.refColumnList.find(col => col.formFieldId == updatedField.formFieldId)
    if (refCol && field && field != null) {
      console.log('Field updated:', updatedField);
    }

    this.updateDynamicForm.emit(this.dynamicForm);
  }

  retriveEditPropChanges(event: { isSuccess: boolean, qry: any }) {
    console.log('Field properties update:', event);
    this.isEditPropWindowVisible = false;

    if (event.isSuccess && event.qry) {
      if (this.isAddFieldSidebar) {
        if (!this.section.rows) {
          this.section.rows = [];
        }
        if (this.section.rows.length === 0) {
          this.section.rows.push({ columns: [] });
        }
        
        const lastRow = this.section.rows[this.section.rows.length - 1];
        if (!lastRow.columns) {
          lastRow.columns = [];
        }
        lastRow.columns.push(event.qry);
        console.log('Added new field to section:', event.qry);
      } else {
        console.log('Updated existing field:', event.qry);
      }
      this.updateDynamicForm.emit(this.dynamicForm);
    } else if (!event.isSuccess && this.isAddFieldSidebar) {
      console.log('Cancelled adding new field');
    }

    this.selectedEditField = undefined;
    this.isAddFieldSidebar = false;
    this.updateEditSettings.emit({ formFieldId: -1 });
  }

  retriveDragFieldSidebarUpdate(event: { status: boolean, data: any[] }) {
    this.dndEnabledIdForSectionFields = -1;
    console.log(event.status, event.data);
    if (!event.status || event.data.length == 0) return;

    if (event.status && event.data.length > 0) {
      crudChangeObj.REORDER = event.data;
      this.updateForm.emit({ caseId: 1 });
    }
  }

  retriveEditFieldsetChanges(event: { isSuccess: boolean, qry: object }) {
    console.log(event.isSuccess, event.qry);
    this.isFieldsetSidebar = false;
    if (event.isSuccess && event.qry != null) {
      this.updateForm.emit({ caseId: 2, data: event.qry });
    }
    if (event.isSuccess && event.qry == null) {
      this.updateForm.emit({ caseId: 4 });
    }
  }


  retriveChecksDragDropSidebar(event: { status: boolean, data: any[] }) {
    this.currentDnDModelId = -1;
    console.log(event.status, event.data);
    if (!event.status || event.data.length == 0) return;

    if (event.status && event.data.length > 0) {
      this.updateForm.emit({ caseId: 3, data: { reorder: { reorder: event.data } } });
    }
  }

  public getDnDModelList(): Array<{ id: number, value: any, orderNo?: number }> {
    return [];
  }
  /*** Siebar Model Methods */
  public getDragFieldModel(): Sections {
    return this.section && this.section != null && this.section != undefined ? JSON.parse(JSON.stringify(this.section)) : null;
  }

  /*** CRUD Manage methods ***/
  setAddMainChanges(field: Columns) {
    let arr = crudChangeObj['ADD'];
    let existedField = arr.find(x => x.formFieldId == field.formFieldId);

    if (existedField)
      existedField = field;
    else
      arr.push(field);
  }

  setUpdateMainChanges(field: Columns, changes: string[]) {
    if (field.isNewField) {
      this.setAddMainChanges(field)
      return;
    }
    let arr = crudChangeObj['UPDATE']
    let prop = {}
    changes.forEach(ch => { prop[ch] = field[ch] })
    let existedField = arr.find(x => x.formFieldId == field.formFieldId)
    if (existedField) {
      if (changes.includes("columnIndex")) {
        existedField.prop.columnIndex = field.columnIndex;
      }
      else if (existedField.prop.hasOwnProperty("columnIndex")) {
        prop['columnIndex'] = field.columnIndex;
        existedField.prop = prop;
      }
      else
        existedField.prop = prop;
    }
    else {
      arr.push({ formFieldId: field.formFieldId, prop: prop })
    }
  }

  setDeleteMainChanges(id: number) {
    const fieldId = id;
    const idx = crudChangeObj['ADD'].findIndex(x => x.formFieldId == fieldId)
    if (idx != -1)
      crudChangeObj['ADD'].splice(idx, 1);
    else
      crudChangeObj['DELETE'].push(fieldId);
    this.updateForm.emit({ caseId: 1 });
  }

  /*** general Methods ***/

  private generalPreparationMethod() {
    this.formProps = { applicationFormId: this.dynamicForm.id };
    if (this.dynamicForm.sections) {
      this.dynamicForm.sections.forEach((section) => {
        if (section.subSections) {
          section.subSections.forEach((subSection) => {
            if (subSection.formFields) {
              subSection.formFields.forEach(field => {
                // add In ColumnList
                this.formFieldIdsList.push(field.id);
              });
            }
          });
        }
      });
    }
    // Get all field types and filter to only show allowed ones for simplified POC
    const allFieldTypes = getControlCategoryList(0, null, 1);
    const allowedControlTypes = ['TextBox', 'DatePicker', 'RadioButton', 'MultilineTextbox', 'DropDown', 'SingleFileUpload', 'Lable', 'MultipleSelectCheckBox', 'LableCheckBox'];
    
    this.fieldTypeList = allFieldTypes.filter(category => 
      category.controls.some(control => allowedControlTypes.includes(control))
    ).map(category => ({
      ...category,
      controls: category.controls.filter(control => allowedControlTypes.includes(control))
    })).filter(category => category.controls.length > 0);
  }

  getColumnFromDynamicForm(fieldId: number) {
    if (this.dynamicForm.sections) {
      for (let i = 0; i < this.dynamicForm.sections.length; i++) {
        const section = this.dynamicForm.sections[i];
        if (section.subSections) {
          for (let j = 0; j < section.subSections.length; j++) {
            const subSection = section.subSections[j];
            if (subSection.formFields) {
              let field = subSection.formFields.find(x => x.id == fieldId);
              if (field) return field;
            }
          }
        }
      }
    }
    return null;
  }

  private prepareFieldObject(controlType: string) {
    let formId = this.dynamicForm.id || 1;
    let formSectionId = this.section.id || 1;
    let uniqueValue: number = this.genrateFormFieldId();
    
    let field: any = {
      id: uniqueValue,
      type: this.getFieldTypeNumber(controlType),
      label: controlType && controlType != '' ? 'Question label' : '',
      placeholder: '',
      required: false,
      options: [],
      columnIndex: 1,
      tabIndex: 1,
      formFieldId: uniqueValue,
      isNewField: true,
      formSectionId: formSectionId,
      isPostLiveManage: false,
      labelName: controlType && controlType != '' ? 'Question label' : null,
      fieldName: formId + '_' + formSectionId + '_' + uniqueValue,
      controlType: controlType && controlType != '' ? controlType : null,
      isRequired: false,
      maxLength: null
    }
    return field;
  }

  prepareCheckObject(checkId: number) {
    return null;
  }

  private genrateFormFieldId(min: number = 1, max: number = 100): number {
    let num: number;
    while (true) {
      num = Math.floor(Math.random() * (max - min)) + min;
      if (this.formFieldIdsList.includes(num))
        continue;
      this.formFieldIdsList.push(num);
      break;
    }
    return num;
  }

  private getFieldTypeNumber(controlType: string): number {
    const typeMap: { [key: string]: number } = {
      'TextBox': 11,
      'DatePicker': 12,
      'RadioButton': 14,
      'MultilineTextbox': 17,
      'DropDown': 18,
      'SingleFileUpload': 22,
      'Lable': 24,
      'MultipleSelectCheckBox': 25,
      'SwitchCheckBox': 28,
      'LableCheckBox': 65
    };
    return typeMap[controlType] || 11; // Default to TextBox
  }

  private anyControlSpecificSetup(field: Columns) {
    switch (field.controlType) {
      case 'DocumentCollection':
        field.maxColumn = 1;
        break;
      case 'SpecialLable':
        field.maxColumn = 1;
        field.questionSpan = 12;
        field.answerSpan = null;
        break;
      case 'LableCheckBox':
        field.maxColumn = 1;
        field.lookupViewId = 1;
        field.questionSpan = 3;
        field.answerSpan = 9;
        break;
      case 'RadioButton':
        field.questionSpan = 8,
          field.answerSpan = 4,
          field.lookupViewId = 1;
        break;
      case 'TextBox':
        field.maxLength = 50;
        break;
      case 'ClientReport':
        field.maxColumn = 3;
        break;
      case 'SingleSlider':
        field.maxLength = 5;
        break;
      default:
        break;
    }

    if (this.section.maxColumn == 1) {
      switch (field.controlType) {
        case 'TextBox':
          field.maxColumn = 3;
          break;
        case 'DropDown':
          field.maxColumn = 3;
          break;
        case 'RadioButton':
          field.maxColumn = 3;
          break;
        case 'MultipleSelectCheckBox':
          field.maxColumn = 3;
          break;
        case 'SingleFileUpload':
          field.maxColumn = 3;
          break;
        case 'SwitchCheckBox':
          field.maxColumn = 3;
          break;
        default:
          break;
      }
    }
  }

  AddFieldInTemplate(field: any) {
    console.log('Adding field to template:', field);
    this.updateDynamicForm.emit(this.dynamicForm)
  }

  AddCheckInTemplate(check: any) {
  }

  RemoveCheckFromTemplate() {
  }

  RemoveFieldFormTemplate(field: Columns) {
    let row: Rows = this.section.rows[this.section.rows.length - 1];
    if (row.columns.length > 1)
      row.columns.pop();
    else
      this.section.rows.pop();

    this.formFieldIdsList.pop();
    this.updateDynamicForm.emit(this.dynamicForm);
  }



  /**
   * CSS Methods
   */
  getConditionalFlag(field: Columns, stage?: Stages, section?: Sections) {
    var flag: String = '';
    switch (field.controlType) {
      case 'LableCheckBox':
        flag = (section?.sectionName.trim().toLowerCase()) == 'most recent job' ? 'work-history' : '';
        break;
      default:
        break;
    }
    return flag;
  }

  getConditionalCSSFlag(field: Columns, stage?: Stages, section?: Sections) {
    var flag: String = '';

    if (field.controlType == "ClientReport") {
      flag = 'col-sm-4';
      return flag;
    }

    switch (field.fieldName) {
      case 'visasummary':
        flag = 'col-sm-8';
        break;
      case 'visaimage':
        flag = 'col-sm-4';
        break;
      default: flag = field.maxColumn && field.maxColumn > 0 ? 'col-sm-' + (12 / field.maxColumn) : 'col-sm-4'
        break;
    }
    return flag;
  }
}
