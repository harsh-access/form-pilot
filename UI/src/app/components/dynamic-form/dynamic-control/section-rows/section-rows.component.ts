import { ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RxPopup, RxToast } from '@rx/view/index';
import { YesNoPopupComponent } from 'src/app/components/shared/custom-control/yes-no-popup/yes-no-popup.component';
import { DynamicForm, SubSection, Section, FormField } from 'src/app/view-modal/DynamicFormModel';
import { getControlCategoryList, IControlCategory } from '../dynamic-common-data/control-category-function';
import { crudChangeObj } from '../dynamic-common-data/crud-changes';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { OnboardedObjectTypes } from '../../Sidebars/fieldset-sidebar/fieldset-propertyList-functions';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';
import { BackgroundCheckService } from '../../background-check.service';
import { IBackgorundCheck } from '../../Sidebars/backgroundcheck-sidebar/backgroundcheck-propertyList-functions';
import { BackgroundCheckEnum } from 'src/app/Enums/BackgroundCheck.enum';

@Component({
  selector: 'app-section-rows',
  templateUrl: './section-rows.component.html'
})
export class SectionRowsComponent implements OnInit {


  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Section;
  @Input() section !: SubSection;
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

  isBackgroundCheckSidebar: boolean = false;
  isAddBackgroundCheckSidebar: boolean = false;
  checkCategory: number = 0;
  currentDnDModelId: number = -1;
  isVideoSection: boolean = false;
  videoSafePath: SafeResourceUrl = null;

  isUBCSection: boolean = false; // Universal Background Check
  isSupportUser: boolean = false;

  refColumnList: Array<FormField> = [];
  isEditPropWindowVisible: boolean = false;
  selectedEditField !: FormField;
  showInStart: boolean = false;
  formFieldIdsList: Array<number> = [];
  fieldTypeList: IControlCategory[];
  isAddFieldsetSidebar: boolean = false;
  fieldsetCategory: number = 0;
  isInProjectClient: boolean = false;

  constructor(
    private ref: ChangeDetectorRef,
    public popup: RxPopup,
    private toast: RxToast,
    private sanitizer: DomSanitizer,
    public _backgroundCheckService: BackgroundCheckService
  ) {
  }

  async ngOnInit() {
    this.generalPreparationMethod();
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


  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  /** Template Methods  **/

  addNewSectionAction() {
    this.addNewSection.emit(this.stage.id);
  }

  addFieldsetAction(category: number) {
    this.fieldsetCategory = category;
    this.isFieldsetSidebar = true;
    this.isAddFieldsetSidebar = true;
    this.selectedEditField = undefined
  }

  // isDependentField(field: FormField) {

  //   if (field.dependentFormFieldColumns.length < 1) return true;

  //   let dependencyInfo = field.dependentFormFieldColumns[0];
  //   let refField = this.refColumnList.find(x => x.formFieldId == dependencyInfo.refFormFieldId)

  //   if (!this.isDependentField(refField)) {
  //     field.isHide = true;
  //     return false;
  //   };

  //   switch (true) {
  //     case (dependencyInfo.refValue == refField?.value && dependencyInfo.action == 'Show'):
  //       field.isHide = false;
  //       return true;
  //       break;
  //     case (dependencyInfo.refValue != refField?.value && dependencyInfo.action == 'Hide'):
  //       field.isHide = false;
  //       return true;
  //       break;
  //     default:
  //       field.isHide = true;
  //       return false;
  //       break;
  //   }
  // }

  // getHiddenClass(row: Rows) {
  //   return row.columns.filter(x => x.isHide != true).length > 0 ? ' ' : 'd-none'
  // }

  addFieldAction(controltype: string) {

    // let field = this.prepareFieldObject(controltype);
    // this.anyControlSpecificSetup(field);

    // if (controltype == "ClientReport") {
    //   field.fieldClass = 'd-none';
    //   field.labelName = 'Report Name';
    // }

    // this.AddFieldInTemplate(field);
    // // this.setAddMainChanges(field);
    // console.log("onADD", crudChangeObj["ADD"]);
    // // this.editableFieldId = field.id;

    // if (controltype != "ClientReport") {
    //   this.updateEditSettings.emit({ formFieldId: field.id })
    // }


    this.isAddFieldSidebar = true;
    // this.selectedEditField = field;
    this.isEditPropWindowVisible = true;
  }

  editPropAction(field: FormField) {
    let obj = this.fieldTypeList.find(x => x.controls.includes(FieldTypeEnum[field.type]));
    if (obj == null || !obj) {
      this.toast.show('Sorry! you cannot edit this field', { status: 'info' });
      return;
    }
    this.selectedEditField = field;
    this.isEditPropWindowVisible = true;
  }

  editCheckAction(id: number) {
    this.isBackgroundCheckSidebar = true;
    this.isAddBackgroundCheckSidebar = false;
    this.checkCategory = id;
  }

  deleteCheckAction(id: number) {
    this.popup.show(YesNoPopupComponent, { bodyMessage: 'Are you sure you want to delete this Check?', buttonUIProps: { yes: { text: 'Delete', color: 'custom-red-bg' }, no: { text: 'Cancel', color: 'bg-primary bg-opacity-75 custom-blue-bg' } } }).then(t => {
      if (!t.isConfirm) return;

      this._backgroundCheckService.DeleteApplicationFormChecks({ applicationFormId: this.dynamicForm.id, checkId: id }).then(async t => {
        if (t.success) {
          await this._backgroundCheckService.getInviteApplicationFormChecks([this.dynamicForm.id]);
          this.toast.show('Check deleted successfully', { status: 'success' });
        }
        else
          this.toast.show(t.message && t.message != '' ? t.message : 'Something went wrong', { status: 'error' });
      })

      this.updateCheckSettings.emit({ checkId: -1 });
    }).catch(e => console.log(e));
  }

  // deleteFieldAction(id: number) {
  //   this.popup.show(YesNoPopupComponent, { bodyMessage: 'Are you sure you want to delete this question?</br> Note: All associated data will be lost.', buttonUIProps: { yes: { text: 'Delete', color: 'custom-red-bg' }, no: { text: 'Cancel', color: 'bg-primary bg-opacity-75 custom-blue-bg' } } }).then(t => {
  //     if (!t.isConfirm) return;

  //     const fieldId = id;
  //     let rows =
  //       this.dynamicForm.stages
  //         .find(s => s.formStageId == this.stage.formStageId).sections
  //         .find(sc => sc.formSectionId == this.section.formSectionId).rows

  //     let colList = rows.find(r => r.columns.find(c => c.formFieldId == fieldId)).columns

  //     const idx = colList.findIndex(cl => cl.formFieldId == fieldId);
  //     if (idx != -1) {
  //       colList.splice(idx, 1);

  //       // manage columnIdx rest of the field, which placed after removed field in the same column array
  //       for (let i = idx; i < colList.length; i++) {
  //         colList[i].columnIndex = colList[i].columnIndex - 1;
  //         this.setUpdateMainChanges(colList[i], ["columnIndex"]);
  //       }

  //       // remove columnsArr if there any field not exists
  //       if (colList.length < 1)
  //         rows.splice(this.section.rows.length - 1, 1)
  //     }

  //     this.updateDynamicForm.emit(this.dynamicForm);
  //     this.setDeleteMainChanges(fieldId);
  //   }).catch(e => console.log(e));

  //   // this.editableFieldId = -1;
  //   this.updateEditSettings.emit({ formFieldId: -1 })

  // }

  /** Template Methods Ended Here */

  /*** Child emit Methods */
  retriveUpdatesForDependent(updatedField: FormField) {
    let field = this.getColumnFromDynamicForm(updatedField.id);
    let refCol = this.refColumnList.find(col => col.id == updatedField.id)
    // if (refCol && field && field != null) {
    //   field.value = updatedField.value;
    //   refCol.value = updatedField.value;
    // }

    this.updateDynamicForm.emit(this.dynamicForm);
  }

  retriveEditPropChanges(event: { isNewAndCanceled?: boolean, isDependencyCRUD?: boolean, field?: FormField, changes: string[] }) {
    console.log(event.field, event.changes, event.isDependencyCRUD);
    this.isEditPropWindowVisible = false;

    if (event.isNewAndCanceled && event.changes.length <= 0)
      // this.RemoveFieldFormTemplate(this.selectedEditField);

    if (event.field && event.changes.length > 0)
      this.setUpdateMainChanges(event.field, event.changes);

    if (crudChangeObj.ADD.length > 0 || crudChangeObj.UPDATE.length > 0)
      this.updateForm.emit({ caseId: 1 });

    this.selectedEditField = undefined;
    this.isAddFieldSidebar = false;
    // this.editableFieldId = -1;
    this.updateEditSettings.emit({ formFieldId: -1 })
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

  retriveBackgroundCheckChanges(event: { isNewAndCanceled?: boolean, isSuccess: boolean, qry: object }) {
    console.log(event.isSuccess, event.qry);
    this.isBackgroundCheckSidebar = false;


    if (event.isNewAndCanceled)
      // this.RemoveCheckFromTemplate();

    if (event.isSuccess) {
      if (this.isAddBackgroundCheckSidebar) {
        this.updateForm.emit({ caseId: 3, data: { add: event.qry } });
      }
      else {
        this.updateForm.emit({ caseId: 3, data: { update: event.qry } });
      }
    }

    this.isAddBackgroundCheckSidebar = false;

    this.checkCategory = 0;
    this.updateCheckSettings.emit({ checkId: -1 })
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
    let x = this._backgroundCheckService.checks.applicationformChecks.filter(x => x.name != "BackgroundCheckDeclaration").map((item, idx) => ({
      id: item.checkId,
      value: item.displayName,
      orderNo: idx + 1
    }));

    console.log(x);
    return x;
  }
  /*** Siebar Model Methods */
  public getDragFieldModel(): SubSection {
    return this.section && this.section != null && this.section != undefined ? JSON.parse(JSON.stringify(this.section)) : null;
  }

  /*** CRUD Manage methods ***/
  setAddMainChanges(field: FormField) {
    let arr = crudChangeObj['ADD'];
    let existedField = arr.find(x => x.formFieldId == field.id);

    if (existedField)
      existedField = field;
    else
      arr.push(field);
  }

  setUpdateMainChanges(field: FormField, changes: string[]) {
    if (this.isAddFieldSidebar) {
      this.setAddMainChanges(field)
      return;
    }
    let arr = crudChangeObj['UPDATE']
    let prop = {}
    changes.forEach(ch => { prop[ch] = field[ch] })
    let existedField = arr.find(x => x.formFieldId == field.id)
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
      arr.push({ formFieldId: field.id, prop: prop })
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
    this.dynamicForm.sections.forEach((section) => {
      section.subSections.forEach((subSection) => {
        subSection.formFields.forEach((formField) => {

          this.formFieldIdsList.push(formField.id);

          // formField.dependentFormFieldColumns.forEach((df) => {
          //   if (this.refColumnList.findIndex(x => x.formFieldId == df.refFormFieldId) == -1) {
          //     let refField = this.getColumnFromDynamicForm(df.refFormFieldId);
          //     if (refField) this.refColumnList.push(refField);
          //   }
          // });
        });
      });
    });
  }

  getColumnFromDynamicForm(fieldId: number) {
    for (let i = 0; i < this.dynamicForm.sections.length; i++) {
      const stage = this.dynamicForm.sections[i];
      for (let j = 0; j < stage.subSections.length; j++) {
        const section = stage.subSections[j];
        for (let k = 0; k < section.formFields.length; k++) {
          const row = section.formFields[k];
          let field = section.formFields.find(x => x.id == fieldId)
          if (field) return field;
        }
      }
    }
    return null;
  }

  // private prepareFieldObject(controlType: string) {
  //   let formId = this.dynamicForm.id;
  //   let formSectionId = this.section.id;
  //   let lastColumn: FormField = this.section.rows[this.section.rows.length - 1].columns.find((x, i, arr) => i == (arr.length - 1));
  //   let uniqueValue: number = this.genrateFormFieldId();
  //   let colIdx = () => {
  //     if (lastColumn.dependentFormFieldColumns && lastColumn.dependentFormFieldColumns.length > 0)
  //       return 1;
  //     else if (lastColumn.controlType == 'SpecialLable' || lastColumn.controlType == 'Lable')
  //       return 1;
  //     else
  //       return lastColumn.columnIndex + 1;
  //   }
  //   let field: FormField = {
  //     formFieldId: uniqueValue,
  //     isNewField: true,
  //     formSectionId: this.section.formSectionId,
  //     tabIndex: lastColumn.tabIndex + 1,
  //     isPostLiveManage: false,
  //     labelName: controlType && controlType != '' ? 'Question label' : null,
  //     fieldName: formId + '_' + formSectionId + '_' + uniqueValue,
  //     controlType: controlType && controlType != '' ? controlType : null,
  //     columnIndex: colIdx(),
  //     questionSpan: 4,
  //     answerSpan: 8,
  //     maxColumn: this.section.maxColumn,
  //     isRequired: false,
  //     isArrayIndex: false,
  //     value: null,
  //     imagePath: null,
  //     videoPath: null,
  //     videoId: 0,
  //     isReadOnly: false,
  //     dependentFormFieldColumns: [],
  //     isComment: false,
  //     isSignatureRequired: false,
  //     placeholder: '',
  //     fieldAnswer: null,
  //     atsPropertyId: null,
  //     atsPropertyValue: null,
  //     fieldValidator: null,
  //     integratedTo: [
  //       FieldTypeEnum.DocumentCollection, FieldTypeEnum.ClientReport,
  //       FieldTypeEnum.LableCheckBox, FieldTypeEnum.SingleFileUpload
  //     ].contains(FieldTypeEnum[controlType]) ? 1 : null
  //   }
  //   return field;
  // }

  prepareCheckObject(checkId: number) {
    return this._backgroundCheckService.getCheckControlList(checkId);
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

  // private anyControlSpecificSetup(field: FormField) {
  //   switch (field.controlType) {
  //     case 'DocumentCollection':
  //       field.maxColumn = 1;
  //       break;
  //     case 'SpecialLable':
  //       field.maxColumn = 1;
  //       field.questionSpan = 12;
  //       field.answerSpan = null;
  //       break;
  //     case 'LableCheckBox':
  //       field.maxColumn = 1;
  //       field.lookupViewId = 1;
  //       field.questionSpan = 3;
  //       field.answerSpan = 9;
  //       break;
  //     case 'RadioButton':
  //       field.questionSpan = 8,
  //         field.answerSpan = 4,
  //         field.lookupViewId = 1;
  //       break;
  //     case 'TextBox':
  //       field.maxLength = 50;
  //       break;
  //     case 'ClientReport':
  //       field.maxColumn = 3;
  //       break;
  //     case 'SingleSlider':
  //       field.maxLength = 5;
  //       break;
  //     default:
  //       break;
  //   }

  //   if (this.section.maxColumn == 1) {
  //     switch (field.controlType) {
  //       case 'TextBox':
  //         field.maxColumn = 3;
  //         break;
  //       case 'DropDown':
  //         field.maxColumn = 3;
  //         break;
  //       case 'RadioButton':
  //         field.maxColumn = 3;
  //         break;
  //       case 'MultipleSelectCheckBox':
  //         field.maxColumn = 3;
  //         break;
  //       case 'SingleFileUpload':
  //         field.maxColumn = 3;
  //         break;
  //       case 'SwitchCheckBox':
  //         field.maxColumn = 3;
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // }

  // AddFieldInTemplate(field: FormField) {
  //   let row = this.section.rows[this.section.rows.length - 1];
  //   if (field.columnIndex == 1 || row.columns.length >= this.section.maxColumn || field.controlType == 'DocumentCollection') {
  //     field.columnIndex = 1;
  //     this.section.rows.push({ columns: [field] });
  //   }
  //   else row.columns.push(field);
  //   this.updateDynamicForm.emit(this.dynamicForm)
  // }

  // AddCheckInTemplate(check: IBackgorundCheck) {
  //   this._backgroundCheckService.checks.applicationformChecks.push(check);
  // }

  // RemoveCheckFromTemplate() {
  //   this._backgroundCheckService.checks.applicationformChecks.pop();
  // }

  // RemoveFieldFormTemplate(field: FormField) {
  //   let row: Rows = this.section.rows[this.section.rows.length - 1];
  //   if (row.columns.length > 1)
  //     row.columns.pop();
  //   else
  //     this.section.rows.pop();

  //   this.formFieldIdsList.pop();
  //   this.updateDynamicForm.emit(this.dynamicForm);
  // }



  // /**
  //  * CSS Methods
  //  */
  // getConditionalFlag(field: FormField, stage?: Section, section?: SubSection) {
  //   var flag: String = '';
  //   switch (field.controlType) {
  //     case 'LableCheckBox':
  //       flag = (section?.sectionName.trim().toLowerCase()) == 'most recent job' ? 'work-history' : '';
  //       break;
  //     default:
  //       break;
  //   }
  //   return flag;
  // }

  // getConditionalCSSFlag(field: FormField, stage?: Section, section?: SubSection) {
  //   var flag: String = '';

  //   if (field.controlType == "ClientReport") {
  //     flag = 'col-sm-4';
  //     return flag;
  //   }

  //   switch (field.fieldName) {
  //     case 'visasummary':
  //       flag = 'col-sm-8';
  //       break;
  //     case 'visaimage':
  //       flag = 'col-sm-4';
  //       break;
  //     default: flag = field.maxColumn && field.maxColumn > 0 ? 'col-sm-' + (12 / field.maxColumn) : 'col-sm-4'
  //       break;
  //   }
  //   return flag;
  // }
}
