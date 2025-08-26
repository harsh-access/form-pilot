import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { DynamicForm, Section, SubSection, FormField } from '../../../view-modal/DynamicFormModel';
import { DynamicFormService } from '../dynamic-form.service';
import { crudChangeObj } from '../dynamic-control/dynamic-common-data/crud-changes';
import { ReorderQuery, SaveChangesModel, StageQuery, UpdateQuery } from 'src/app/view-modal/EditFormModels';
// import { RxPopup, RxToast } from '@rx/view/index'; // Removed for simplified POC
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';
import { ApiResponseModel } from 'src/app/view-modal/GeneralApiModel';
import { FormTypeEnum } from 'src/app/Enums/ApplicationForm.enum';
import { InviteApplicantComponent } from '../invite-applicant/invite-applicant.component';
import { YesNoPopupComponent } from '../../shared/custom-control/yes-no-popup/yes-no-popup.component';
import { RxStorage } from '@rx/storage';
import { CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { ISectionList, ISubSectionList, IStageList } from 'src/app/view-modal/FormStructuctureModels';
import { ISectionSidebarModel, IStageSidebarModel } from 'src/app/view-modal/SidebarModels/StageSideBarModel';
import { CRUDOPERATION } from 'src/app/Enums/Operations.enum';
import { DatePipe } from '@angular/common';
import { LocalDateFormat } from '../../shared/date-format/local-date-format';
import { OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';


@Component({
  selector: 'app-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.css'],
})
export class FormViewComponent implements OnInit {
  @Input() formId: number = 0;
  @Input() isFormEditable !: boolean;

  FormType = FormTypeEnum;

  dynamicForm!: DynamicForm;
  isShowComponent: boolean = false;
  sections!: Array<Section>;
  sectionList!: Array<ISectionList>;
  subSectionList!: Array<ISubSectionList>;
  columnSpan: number = 0;
  isViewTemplate: boolean = true;
  isPty: boolean = false;
  editableFieldId: number = -1;
  editableCheckId: number = -1;
  editableSectionId: number = -1;
  editableStageId: number = -1;
  editableIdForStageSectionSidebar: number = -1;
  currentDnDModelId = -1;
  isSectionSidebar: boolean = false;
  sidebarPosition: string = 'end';
  isShowDragBoundry: boolean = false;
  draftExpirydate: string = '';

  //*** Added For Fieldset sidebar */
  isFieldsetSidebar: boolean = false;
  fieldsetCategory: number = 0;
  editableSection: Section;
  //** End Fieldset sidebar*/
  isSupportUser:boolean=false;
  // RestractionArray
  restrictedSectionsForView: string[] = ["ispty"];
  restrictedSectionsForEdit: string[] = ['work history', "payroll", "timeline", "finance team section", "withholding declaration"];

  hiddenSectionHeadings: string[] = ['Withholding Declaration Form', 'Super Choice Form', 'Bank Details'];

  constructor(private dynamicFormService: DynamicFormService) { }

  ngOnInit(): void {
    this.isViewTemplate = !this.isFormEditable;
    this.fetchFormData(true);
    this.isSupportUser = this.checkSupportUser();
    console.log("support user  : ",this.isSupportUser);
  }

  private fetchFormData(shopInitialPopup: boolean = false) {
    console.log('Fetching form data...');
    this.dynamicFormService.getForm([this.formId, this.isViewTemplate]).subscribe((p: DynamicForm) => {
      console.log('Received form data:', p);
      console.log('Number of sections in response:', p?.sections?.length);
      this.dynamicForm = p;
      this.draftExpirydate = "";

      if (shopInitialPopup) {
        this.displayInitialFormState(null)
      }

      this.isPty = false;
      this.displayForm();
    });
  }

  private displayForm() {
    console.log('Displaying form with sections:', this.dynamicForm.sections);
    console.log('Number of sections to display:', this.dynamicForm.sections?.length);
    this.sectionList = this.dynamicForm.sections.map((item) => {
      return {
        id: item.id,
        title: item.title,
        orderNo: item.orderNo,
        formStageId: item.id, // Map id to formStageId for template compatibility
        stageName: item.title, // Map title to stageName for template compatibility
        sections: item.subSections || [] // Map subSections for compatibility
      };
    });

    this.sections = this.dynamicForm.sections;
    console.log('Updated sectionList:', this.sectionList);
    console.log('Updated sections:', this.sections);
    if (this.sections.length > 0 && this.sectionList.length > 0) {
      this.isShowComponent = true
    };
  }

  onFormEdit(): void {
    // console.log(form);
      this.dynamicFormService.getEditableFormId([this.formId]).subscribe((t: ApiResponseModel) => {
        let url: string;
        if (t.isSuccess && t.message != "") {
          if (window.location.origin.toString().startsWith("http://localhost:4200") == true)
            url = "http://localhost:4300/#/form-edit/" + window.btoa(t.message.toString()).replace('==', '!!').replace('=', '!');
          else
            url = window.location.origin + "/formadd/index#/form-edit/" + window.btoa(t.message.toString()).replace('==', '!!').replace('=', '!');
          //window.open(url);
          window.location.replace(url)
        }
        else {
          console.error(t.message != null && t.message != undefined && t.message != "" ? t.message : 'something went wrong');
        }
      });
  }

  /** Child Emit Methods */
  retriveUpdateForDynamicForm(form: DynamicForm) {
    this.dynamicForm = form;
  }

  retriveEditSettings(event: { formFieldId: number }) {
    this.editableFieldId = event.formFieldId;
    this.editableSectionId = -1;
    this.editableCheckId = -1;
  }

  retriveEditCheckSettings(event: { checkId: number }) {
    this.editableCheckId = event.checkId;
    this.editableFieldId = this.editableStageId = this.editableSectionId = -1;
  }

  scrollJustAboveView(el: any) {
    var rect = el.getBoundingClientRect();
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    if (!((rect.top >= 0 && rect.top <= windowHeight) && (rect.left <= windowWidth && rect.right >= 0))) {
      window.scrollTo({ top: rect.top - 50 + window.scrollY, left: window.scrollX, behavior: "smooth" });
    }
    el.dispatchEvent(new Event('click'));
  }

  retriveSaveFormChanges(event: { caseId: number, data?: any | any[] }) {
    switch (event.caseId) {
      case 1: // FieldCalls
        this.saveForm();
        break;
      case 2: //FieldSetCalls
        event.data && this.saveFieldSetProcess(event.data);
        break;
      case 3: //BackgroundCheckCalls
        event.data && this.saveBackgroundCheckProcess(event.data);
        break;
      case 4: //Reset Form Data Whenever Only Dependency Change
        this.resetFormData();
        break;
      default:
        break;
    }
  }

  retriveStageSidebarUpdate(event: { status: boolean, data: any }) {
    const tempId: number = this.editableIdForStageSectionSidebar;
    this.editableIdForStageSectionSidebar = -1;
    this.sidebarPosition = 'end';
    this.editableSectionId = -1;
    this.editableStageId = -1;

    if (this.isSectionSidebar) {
      this.isSectionSidebar = false;
      if (!event.status && tempId == 0)
        this.sectionList = [];
      // this.sectionList.pop();
      else if (event.status && tempId == 0) {
        this.saveSectionUpdate([{ opt: CRUDOPERATION.Add, qry: event.data }]);
      }
      else if (event.status && tempId > 0) {
        let arr: Array<{ opt: CRUDOPERATION, qry: any }> = [];
        if (event.data) arr.push({ opt: CRUDOPERATION.Update, qry: { id: tempId, prop: event.data } });
        if (arr.length > 0) this.saveSectionUpdate(arr);
      }
    }
    else {
      if (!event.status && tempId == 0)
        this.sectionList.pop();
      else if (event.status && tempId == 0)
        this.saveSectionUpdate([{ opt: CRUDOPERATION.Add, qry: { stageName: event.data.stageName } }]);
      else if (event.status && tempId > 0)
        this.saveSectionUpdate([{ opt: CRUDOPERATION.Update, qry: { id: tempId, prop: { stageName: event.data.stageName } } }]);
    }
  }

  retriveSectionDragDropSidebar(event: { status: boolean, data: any[] }) {
    this.currentDnDModelId = -1;
    if (!event.status || event.data.length == 0) return;
    let arr: Array<{ opt: CRUDOPERATION, qry: any }> = [];
    if (event.data) arr.push({ opt: CRUDOPERATION.Reorder, qry: event.data });
    if (arr.length > 0) this.saveSectionUpdate(arr);
  }

  /** Methods to Mange Hide/Show field, section, stage **/

  isPtySection(sectionName: string, subSection: SubSection) {
    return true;
  }

  /** View Methods */
  isSectionHeadingVisible(section: Section, subSection: SubSection): boolean {
    return true;
  }

  /** Edit Section Methods */
  isValidForEditSection(stageName: string) {
    return this.restrictedSectionsForEdit.find((word: string) => stageName.toLowerCase().includes(word)) ? false : true;
  }

  /** Test publish discard candiadte form */
  createCandidate() {
    console.log('Create candidate functionality not available in simplified POC');
  }

  discardForm() {
    console.log('Discard form functionality not available in simplified POC');
  }

  publishForm() {
    console.log('Publish form functionality not available in simplified POC');
  }

  /** Save Form Methods **/
  /* prepare Stage Query */
  private prepareStageQuery(opt: CRUDOPERATION, qry: any): string {
    let query: StageQuery = null;
    switch (opt.toUpperCase()) {
      case 'ADD':
        query = { add: qry };
        break;
      case 'UPDATE':
        query = { update: qry };
        break;
      case 'REORDER':
        query = { reorder: qry };
        break;
      case 'DELETE':
        query = { delete: typeof qry === 'number' ? qry : null };
        break;
      default:
        query = null
        break;
    }
    console.log(query);
    return query == null ? null : JSON.stringify(query);
  }

  private prepareSectionQuery(array: Array<{ opt: CRUDOPERATION, qry: any }>): string {
    let query: StageQuery = {};
    array.forEach(arr => {
      switch (arr.opt.toUpperCase()) {
        case 'ADD':
          query['add'] = arr.qry;
          break;
        case 'UPDATE':
          query['update'] = arr.qry;
          break;
        case 'REORDER':
          query['reorder'] = arr.qry;
          break;
        case 'DELETE':
          if (typeof arr.qry === 'number')
            query['delete'] = arr.qry;
          break;
        default:
          query = null;
          break;
      }
    });
    // console.log("prepare qry",query);
    return query == null || Object.keys(query).length === 0 ? null : JSON.stringify(query);
  }

  saveStageUpdate(opt: CRUDOPERATION, qry: any) {
    if (!qry)
      return;
    const data: SaveChangesModel = { applicationFormId: this.dynamicForm.applicationFormId || this.dynamicForm.id, query: this.prepareStageQuery(opt, qry), isPDFChangeRequired: opt.toLowerCase() != 'update' ? true : false };
    if (data && data.query != null && data.query != '') {
      this.dynamicFormService.postStageChanges(data).subscribe(t => {
        if (t.isSuccess) {
          let toastMsg = '';
          switch (opt.toUpperCase()) {
            case 'ADD':
              toastMsg = 'New Section added successfully.';
              break;
            case 'UPDATE':
            case 'REORDER':
              toastMsg = 'Section updated successfully.';
              break;
            case 'DELETE':
              toastMsg = 'Section deleted successfully.';
              break;
            default:
              break;
          }
          console.log(toastMsg);
        }
        else
          console.error(t.message && t.message != '' ? t.message : 'something went wrong');
        this.fetchFormData();
      });
    }
    else
      console.error('Sorry !! Operation not initiated');
  }

  saveSectionUpdate(qryArr: Array<{ opt: CRUDOPERATION, qry: any }>) {
    if (qryArr.length < 1) return;

    const data: SaveChangesModel = { applicationFormId: this.dynamicForm.applicationFormId || this.dynamicForm.id, query: this.prepareSectionQuery(qryArr), isPDFChangeRequired: false };
    if (data && data.query != null && data.query != '') {
      this.dynamicFormService.postSectionChanges(data).subscribe(t => {
        if (t.isSuccess)
          console.log('Section changes are updated');
        else
          console.error(t.message && t.message != '' ? t.message : 'something went wrong');
        this.fetchFormData();
      });
    }
    else
      console.error('Something went Wrong');
  }

  saveForm() {
    const finalObject: SaveChangesModel = { applicationFormId: this.dynamicForm.applicationFormId || this.dynamicForm.id, query: this.prepareQueryObject(), isPDFChangeRequired: this.verifyForStagePDF() }
    console.log(finalObject);
    if (finalObject.query == '') {
      console.log('No change Found');
      return;
    }

    this.dynamicFormService.postSaveForm(finalObject).subscribe((res: ApiResponseModel) => {
      if (res.isSuccess)
        console.log("Form changes saved successfully");
      else
        console.error(res.message);
      this.cleanUpCRUDObject();
      this.fetchFormData();
    });
  }

  /** FieldSet Api Call Methods */
  saveFieldSetProcess(qry: any) {
    const data: SaveChangesModel = { applicationFormId: this.dynamicForm.applicationFormId, query: JSON.stringify(qry), isPDFChangeRequired: false };
    if (data && data.query != null && data.query != '') {
      console.log('Fieldset Data: ', data);
      this.dynamicFormService.postSaveFieldsetChanges(data).subscribe(t => {
        if (t.isSuccess)
          console.log('Form changes saved successfully');
        else
          console.error(t.message && t.message != '' ? t.message : 'something went wrong');
        this.fetchFormData();
      });
    }
    else
      console.error('Something went Wrong');
  }

  /** Fetch New Data For Dependency Change */
  resetFormData() {
    console.log('Form changes saved successfully');
    this.fetchFormData();
  }

  /** BackgroundCheck Api Call Methods */
  saveBackgroundCheckProcess(qry: { add: any, update: any, reorder: any}) {
    console.log('Background check functionality not available in simplified POC');
  }

  private cleanUpCRUDObject() {
    crudChangeObj.ADD = [];
    crudChangeObj.UPDATE = [];
    crudChangeObj.REORDER = [];
    crudChangeObj.DELETE = [];
  }

  private prepareQueryObject() {
    this.optimizeQueryObject();
    let draftObject = JSON.parse(JSON.stringify(crudChangeObj));

    // ADD Logic
    if (draftObject.ADD.length > 0) {
      let removeKeyList: string[] = ['fileUrl', 'fileName', 'fileExt', 'fileType', 'commentValue', 'errorMessage', 'isHide', 'lookUps', 'dependentFormFieldColumns', 'isReadOnly', 'videoId', 'videoPath', 'value', 'fieldName', 'isNewField', 'formFieldId']
      draftObject.ADD.forEach((obj) => {
        for (const [key, value] of Object.entries(obj)) {
          switch (true) {
            case key == 'formSectionId':
              obj.applicationFormStageSectionId = obj.formSectionId;
              delete obj.formSectionId;
              break;
            case key == 'controlType':
              obj.fieldType = FieldTypeEnum[obj.controlType];
              delete obj.controlType;
              break;
            case key == 'isRequired':
              obj.isMandatory = obj.isRequired;
              delete obj.isRequired;
              break;
            case key == 'maxLength':
              obj.fieldMaxLength = obj.maxLength;
              delete obj.maxLength;
              break;
            case (key == 'fieldName' && obj[key] == 'UploadDocumentCollection'):
              break;
            case removeKeyList.includes(key):
              delete obj[key];
              break;
            case (value == null || value == ''):
              delete obj[key]
              break;
            default:
              break;
          }
        }
      });
      draftObject.ADD = JSON.stringify(draftObject.ADD);
    }
    else
      delete draftObject.ADD;

    // UPDATE Logic
    if (draftObject.UPDATE.length > 0) {
      draftObject.UPDATE.forEach((obj) => {
        if ('controlType' in obj.prop) { obj.prop.fieldType = FieldTypeEnum[obj.prop.controlType]; delete obj.prop.controlType; }
        if ('isRequired' in obj.prop) { obj.prop.isMandatory = obj.prop.isRequired; delete obj.prop.isRequired; }
        if ('maxLength' in obj.prop) { obj.prop.fieldMaxLength = obj.prop.maxLength; delete obj.prop.maxLength; }
      });
      draftObject.UPDATE = JSON.stringify(draftObject.UPDATE);
    }
    else
      delete draftObject.UPDATE;

    // REORDER Logic
    if (draftObject.REORDER.length > 0) {
      draftObject.REORDER = JSON.stringify(draftObject.REORDER);
    }
    else
      delete draftObject.REORDER;

    // DELETE Logic
    if (draftObject.DELETE.length > 0) {
      draftObject.DELETE = JSON.stringify(draftObject.DELETE);
    }
    else
      delete draftObject.DELETE;

    return draftObject && Object.keys(draftObject).length > 0 ? JSON.stringify({ ...draftObject }) : '';
  }

  private optimizeQueryObject() {
    crudChangeObj.UPDATE.forEach((f, idx) => {
      if (crudChangeObj.DELETE.includes(f.formFieldId)) {
        crudChangeObj.UPDATE.splice(idx, 1);
      }
    });
  }

  verifyForStagePDF(): boolean {
    let flag = false;
    if (crudChangeObj.DELETE.length > 0) {
      this.dynamicForm.sections.every(stage => {
        const isStageEmpty = stage.sections.filter((section) => section.rows.length > 0 && section.rows[0].columns.length > 0).length == 0;
        if (isStageEmpty)
          flag = true;
        return !flag;
      })
    }
    return flag;
  }

  /**
   * Temlate Methods
   */

  addNewStageAction(event: any) {
    this.sectionList.push({ id: 0, title: 'New Section', orderNo: this.sectionList.length + 1, formStageId: 0, stageName: 'New Section', stageOrderNo: this.sectionList.length + 1 });
    this.editableStageId = 0;
    this.isSectionSidebar = false;
    this.editableIdForStageSectionSidebar = 0;
    this.sidebarPosition = window.innerWidth / 2 > event.clientX ? 'end' : 'start';
  }

  addBackgroundchecks(event: any) {
    this.sectionList.push({ id: 0, title: 'Background Checks', orderNo: this.sectionList.length + 1, formStageId: 0, stageName: 'Background Checks', stageOrderNo: this.sectionList.length + 1 });
    this.editableStageId = 0;
    // this.isSectionSidebar = false;
    // this.editableIdForStageSectionSidebar = 0;
    // this.sidebarPosition = window.innerWidth / 2 > event.clientX ? 'end' : 'start';
  }

  editStageAction(event: any, stage: IStageList) {
    this.editableIdForStageSectionSidebar = stage.formStageId;
    this.isSectionSidebar = false;
    this.sidebarPosition = window.innerWidth / 2 > event.clientX ? 'end' : 'start';
  }

  deleteStageAction(stage: IStageList) {
    console.log('Delete section confirmation - simplified POC');
    this.saveStageUpdate(CRUDOPERATION.Delete, stage.formStageId);
  }

  AddBackgroundCheckAction(stage: IStageList) {
    console.log('Background check functionality not available in simplified POC');
    return; // Background check disabled
  }


  addNewSectionAction(event: number = -1) {
    if (event == -1) return;
    this.setupSectionList(event);
    let secObject: ISectionList = { id: 0, title: 'New Sub Section', orderNo: this.sectionList.length + 1, formSectionId: 0, sectionName: 'New Sub Section', sectionOrderNo: this.sectionList.length + 1, formStageId: event };
    this.sectionList.push(secObject);
    this.editableSectionId = 0;
    this.editableIdForStageSectionSidebar = 0;
    this.isSectionSidebar = true;
  }

  editActionOnSection(formStageId: number = -1, formSectionId: number = -1) {
    if (formStageId == -1 || formSectionId == -1) return;
    this.setupSectionList(formStageId);
    let section = this.dynamicForm.sections.map(stage => stage.sections.map(section => section)).flat(2).find(x => x.formSectionId == formSectionId);
    if (section && section.sectionKeyName.startsWith("EditFormInduction-")) {
      this.isFieldsetSidebar = true;
      this.fieldsetCategory = 2;
      this.editableSection = { ...section, subSections: [] };
      return;
    }
    this.editableIdForStageSectionSidebar = formSectionId;
    this.isSectionSidebar = true;
  }

  deleteActionOnSection(formSectionId: number = -1) {
    if (formSectionId == -1) return;
    console.log('Delete sub-section confirmation - simplified POC');

    let stageId: number = -1;
    let count = 0;
    this.dynamicForm.sections.forEach(stage => {
      if (stage.sections.findIndex(x => x.formSectionId == formSectionId) == -1) return;
      stageId = stage.sections.length == 1 ? stage.formStageId : -1;
    });
    if (stageId > 0)
      this.saveStageUpdate(CRUDOPERATION.Delete, stageId);
    else
      this.saveSectionUpdate([{ opt: CRUDOPERATION.Delete, qry: formSectionId }]);
  }

  /**Validation methods */
  isValidStageToManage(stage: string = null, opt: number = 0): boolean {
    if (stage == null || ["recruiter"].findIndex((word: string) => stage.toLowerCase().includes(word)) != -1)
      return false;

    let array: string[] = [];
    switch (opt) {
      case 1: // Edit
        array = ["payroll", "work history", "withholding declaration"];
        break;
      case 2: // Delete
        array = [];
        break;
      case 3: // Drag
        array = [];
        break;
      default:
        return true;
        break;
    }

    if (array.length < 1)
      return true;

    return array.findIndex((word: string) => stage.toLowerCase().includes(word)) == -1 ? true : false;
  }

  isValidSectionToManage(section: string = null, stageName: string, opt: number = 0): boolean {
    if (!section) return false;

    if (!this.isValidStageToManage(stageName, 1)) return false;

    if ([].findIndex((word: string) => section.toLowerCase().includes(word)) != -1)
      return false;

    let array: string[] = [];
    switch (opt) {
      case 1: // Edit
        array = [];
        break;
      case 2: // Delete
        array = [];
      case 3: // Drag
        array = [];
        break;
      default:
        return true;
        break;
    }

    if (array.length < 1)
      return true;

    return array.findIndex((word: string) => section.toLowerCase().includes(word)) == -1 ? true : false;
  }

  /*
  ** Setup Methods
  */
  private setupSectionList(formStageId: number) {
    this.sectionList = this.dynamicForm.sections.find(x => x.formStageId == formStageId).sections.map(section => ({
      id: section.formSectionId,
      title: section.sectionName,
      orderNo: section.sectionOrderNo,
      formSectionId: section.formSectionId,
      sectionName: section.sectionName,
      sectionOrderNo: section.sectionOrderNo,
      formStageId: formStageId
    }));
  }

  /** Get Sidber Models */
  public getStageOrSectionModel(): IStageSidebarModel | ISectionSidebarModel {
    if (this.editableIdForStageSectionSidebar > -1) {
      if (this.isSectionSidebar) {
        let section = this.sectionList.find(x => x.formSectionId == this.editableIdForStageSectionSidebar)
        return { formId: this.dynamicForm.applicationFormId, sectionName: (this.editableIdForStageSectionSidebar > 0 && section && section.sectionName) ? section.sectionName : null, formStageId: section.formStageId };
      }
      else {
        return { formId: this.dynamicForm.applicationFormId, stageName: this.editableIdForStageSectionSidebar > 0 ? this.sectionList.find(x => x.formStageId == this.editableIdForStageSectionSidebar).stageName : null };
      }
    }
    else return null;
  }

  public getDnDModelList() {
    let arr = this.dynamicForm.sections.find(x => x.formStageId == this.currentDnDModelId).sections.map(section => ({
      id: section.formSectionId,
      value: section.sectionName,
      orderNo: section.sectionOrderNo
    }));

    if (arr.length > 0)
      return arr;
    else[];
  }


  scrollView(formStageId: number) {
    document.getElementById(`stage-${formStageId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  scrollToTop() {
    window.scrollTo({ behavior: "smooth", top: 0, left: 0 });
  }

  /**
   * HostListener Methods
   */
  scrollTopIconVisible: boolean = false;

  @HostListener('window:scroll', ['$event']) onWindowScroll(event: any) {
    this.scrollTopIconVisible = window.pageYOffset > 500 ? true : false;
  }

  /** CDK Methods   */
  dragEntered(event: CdkDragEnter<any>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.isShowDragBoundry = false;

    let before = JSON.stringify(this.dynamicForm.sections);

    const restrictedIDX = this.dynamicForm.sections.findIndex(x => x.stageName.toLowerCase().includes('recruiter'))
    if (restrictedIDX != -1 && dropIndex >= restrictedIDX) {
      console.log(`You cannot move position of the ${this.dynamicForm.sections[restrictedIDX].stageName}`);
      return;
    }

    moveItemInArray(this.dynamicForm.sections, dragIndex, dropIndex);
    if (before == JSON.stringify(this.dynamicForm.sections)) return;
    const qry: ReorderQuery[] = this.dynamicForm.sections.map((s, idx) => { return { id: s.formStageId, orderNo: idx + 1 } });
    this.saveStageUpdate(CRUDOPERATION.Reorder, qry);
  }

  /*** CDK Ended Here ***/

  /*** Fieldset Methods */

  retriveEditFieldsetChanges(event: { isSuccess: boolean, qry: object }) {
    console.log(event.isSuccess, event.qry);
    this.isFieldsetSidebar = false;
    if (event.isSuccess && event.qry != null) {
      this.retriveSaveFormChanges({ caseId: 2, data: event.qry });
    } else if (event.isSuccess && event.qry == null) {
      this.retriveSaveFormChanges({ caseId: 4, data: null });
    }
  }

  private getFormFields(): FormField[] {
    return this.dynamicForm.sections.map(section => section.subSections.map(subSection => subSection.formFields)).flat(2);
  }

  private getGroupFieldset(fieldGroupId: number) {
    return this.getFormFields().filter(x => x.fieldGroupId == fieldGroupId);
  }

  /*** Fieldset Ended Here */

  /*** Draft Form Popup Display */

  displayInitialFormState(applicationFormInfo: any) {
    if (applicationFormInfo != null && applicationFormInfo.templateDescription != null && applicationFormInfo.templateDescription == "1") {
      console.log('Draft form notification - simplified POC');
    }
  }

  /*** Draft Form Popup Display Ended Here*/
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
        (
          username.startsWith("supportlogin+") ||
          username.endsWith("@onboarded.com.au") ||
          username.endsWith("@radixweb.com") )
      ) {
        return true;
      }
    }

    return false; // Default return for non-support users or missing data
  }

}
