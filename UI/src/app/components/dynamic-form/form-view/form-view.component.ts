import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { DynamicForm, FormField, Section, SubSection } from '../../../view-modal/DynamicFormModel';
import { DynamicFormService } from '../dynamic-form.service';
import { crudChangeObj } from '../dynamic-control/dynamic-common-data/crud-changes';
import { ReorderQuery, SaveChangesModel, StageQuery, UpdateQuery } from 'src/app/view-modal/EditFormModels';
import { RxPopup, RxToast } from '@rx/view/index';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';
import { ApiResponseModel } from 'src/app/view-modal/GeneralApiModel';
import { FormTypeEnum } from 'src/app/Enums/ApplicationForm.enum';
import { InviteApplicantComponent } from '../invite-applicant/invite-applicant.component';
import { YesNoPopupComponent } from '../../shared/custom-control/yes-no-popup/yes-no-popup.component';
import { RxStorage } from '@rx/storage';
import { CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { ISectionList, IStageList } from 'src/app/view-modal/FormStructuctureModels';
import { ISectionSidebarModel, IStageSidebarModel } from 'src/app/view-modal/SidebarModels/StageSideBarModel';
import { CRUDOPERATION } from 'src/app/Enums/Operations.enum';
import { DatePipe } from '@angular/common';
import { LocalDateFormat } from '../../shared/date-format/local-date-format';
import { OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { BackgroundCheckService } from '../background-check.service';


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
  sectionList!: Array<Section>;
  subSectionList!: Array<SubSection>;
  columnSpan: number = 0;
  isViewTemplate: boolean = true;
  isPty: boolean = false;
  editableFieldId: number = -1;
  editableCheckId: number = -1;
  editableSectionId: number = -1;
  editableStageId: number = -1;
  editableIdForStageSectionSidebar: number = -1;
  currentDnDModelId = -1;
  isSubSectionSidebar: boolean = false;
  sidebarPosition: string = 'end';
  isShowDragBoundry: boolean = false;
  draftExpirydate: string = '';

  //*** Added For Fieldset sidebar */
  isFieldsetSidebar: boolean = false;
  fieldsetCategory: number = 0;
  editableSection: Section;
  //** End Fieldset sidebar*/
  isSupportUser: boolean = false;

  constructor(private dynamicFormService: DynamicFormService, private _backgroundCheckService: BackgroundCheckService, private toast: RxToast, private popup: RxPopup, private storage: RxStorage, private datePipe: DatePipe, private localDateTime: LocalDateFormat) { }

  ngOnInit(): void {
    this.isViewTemplate = !this.isFormEditable;
    this.fetchFormData(true);
    this.isSupportUser = this.checkSupportUser();
    console.log("support user  : ", this.isSupportUser);

  }

  private fetchFormData(shopInitialPopup: boolean = false) {
    this.dynamicFormService.getForm([this.formId, this.isViewTemplate]).subscribe((p: DynamicForm) => {
      if (p["isSuccess"] == false) {
        let message = this.isViewTemplate ? 'Invalid Form' : 'Invalid Form for Edit Operation';
        this.toast.show(message, { status: 'error' });
        return;
      }

      this.dynamicForm = p;

      this.displayForm();
    });
  }

  private displayForm() {
    this.sectionList = this.dynamicForm.sections.map((item, index) => {
      return {
        id: item.id,
        orderNo: item.orderNo,
        title: item.title,
        subSections: []
      };
    });

    this.sections = this.dynamicForm.sections;
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
        this.toast.show(t.message != null && t.message != undefined && t.message != "" ? t.message : 'something went wrong', { status: 'error' })
      }
    });
  }

  /** Child Emit Methods */
  retriveUpdateForDynamicForm(form: DynamicForm) {
    this.dynamicForm = form;
  }

  retriveEditSettings(event: { formFieldId: number }) {
    this.editableFieldId = event.formFieldId;
    this.editableStageId = this.editableSectionId = this.editableCheckId = -1;
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

    if (this.isSubSectionSidebar) {
      this.isSubSectionSidebar = false;
      if (!event.status && tempId == 0)
        this.subSectionList = [];
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
        this.saveStageUpdate(CRUDOPERATION.Add, { stageName: event.data.stageName });
      else if (event.status && tempId > 0)
        this.saveStageUpdate(CRUDOPERATION.Update, { id: tempId, prop: { stageName: event.data.stageName } });
    }
  }

  retriveSectionDragDropSidebar(event: { status: boolean, data: any[] }) {
    this.currentDnDModelId = -1;
    if (!event.status || event.data.length == 0) return;
    let arr: Array<{ opt: CRUDOPERATION, qry: any }> = [];
    if (event.data) arr.push({ opt: CRUDOPERATION.Reorder, qry: event.data });
    if (arr.length > 0) this.saveSectionUpdate(arr);
  }

  /** Test publish discard candiadte form */
  createCandidate() {
    this.popup.show(InviteApplicantComponent, { form: this.dynamicForm }).then(t => {
      console.log(t);
    });
  }

  discardForm() {
    this.popup.show(YesNoPopupComponent, { bodyMessage: 'Are you sure you want to discard all form changes?' }).then(res => {
      console.log(res);
      if (!res.isConfirm) return;
      this.dynamicFormService.getDiscardForm([this.dynamicForm.id]).subscribe((t) => {
        if (t.isSuccess) {
          let url: string = window.location.origin.toString().includes("localhost") ? window.location.origin + '/#/message' : window.location.origin + "/formadd/index#/message";
          this.storage.local.save('message', 'Your application form changes has been discarded successfully. Thank you.<br>You can close this window now.');
          window.open(url, "_self");
        } else {
          this.toast.show(t.message ? t.message : 'Something went wrong', { status: 'error' });
        }
      });
    });
  }

  publishForm() {
    this.popup.show(YesNoPopupComponent, { bodyMessage: 'Are you sure you want to publish the form changes?' }).then(res => {
      console.log(res);
      if (!res.isConfirm) return;

      this.dynamicFormService.getPublishForm([this.dynamicForm.id]).subscribe((t) => {
        if (t.isSuccess) {
          let url: string = window.location.origin.toString().includes("localhost") ? window.location.origin + '/#/message' : window.location.origin + "/formadd/index#/message";
          console.log(url);
          this.storage.local.save('message', 'Your application form changes has been successfully updated. Thank you.<br>You can close this window now.');
          window.open(url, "_self");
        } else {
          this.toast.show(t.message ? t.message : 'Something went wrong', { status: 'error' });
        }
      });
    });
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
    const data: SaveChangesModel = { applicationFormId: this.dynamicForm.id, query: this.prepareStageQuery(opt, qry) };
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
          this.toast.show(toastMsg);
        }
        else
          this.toast.show(t.message && t.message != '' ? t.message : 'something went wrong', { status: 'error' });
        this.fetchFormData();
      });
    }
    else
      this.toast.show('Sorry !! Operation not initiated', { status: 'error' })
  }

  saveSectionUpdate(qryArr: Array<{ opt: CRUDOPERATION, qry: any }>) {
    if (qryArr.length < 1) return;

    const data: SaveChangesModel = { applicationFormId: this.dynamicForm.id, query: this.prepareSectionQuery(qryArr),  };
    if (data && data.query != null && data.query != '') {
      this.dynamicFormService.postSectionChanges(data).subscribe(t => {
        if (t.isSuccess)
          this.toast.show('Section changes are updated');
        else
          this.toast.show(t.message && t.message != '' ? t.message : 'something went wrong', { status: 'error' });
        this.fetchFormData();
      });
    }
    else
      this.toast.show('Something went Wrong', { status: 'error' })
  }

  saveForm() {
    const finalObject: SaveChangesModel = { applicationFormId: this.dynamicForm.id, query: this.prepareQueryObject() }
    console.log(finalObject);
    if (finalObject.query == '') {
      this.toast.show('No change Found', { status: 'info' });
      return;
    }

    this.dynamicFormService.postSaveForm(finalObject).subscribe((res: ApiResponseModel) => {
      if (res.isSuccess)
        this.toast.show("Form changes saved successfully");
      else
        this.toast.show(res.message, { status: 'error' });
      this.cleanUpCRUDObject();
      this.fetchFormData();
    });
  }

  /** FieldSet Api Call Methods */
  saveFieldSetProcess(qry: any) {
    const data: SaveChangesModel = { applicationFormId: this.dynamicForm.id, query: JSON.stringify(qry) };
    if (data && data.query != null && data.query != '') {
      console.log('Fieldset Data: ', data);
      this.dynamicFormService.postSaveFieldsetChanges(data).subscribe(t => {
        if (t.isSuccess)
          this.toast.show('Form changes saved successfully');
        else
          this.toast.show(t.message && t.message != '' ? t.message : 'something went wrong', { status: 'error' });
        this.fetchFormData();
      });
    }
    else
      this.toast.show('Something went Wrong', { status: 'error' })
  }

  /** Fetch New Data For Dependency Change */
  resetFormData() {
    this.toast.show('Form changes saved successfully');
    this.fetchFormData();
  }

  /** BackgroundCheck Api Call Methods */
  saveBackgroundCheckProcess(qry: { add: any, update: any, reorder: any }) {
    if (qry.add) {
      this._backgroundCheckService.AddApplicationFormChecks({ applicationFormId: this.dynamicForm.id, ...qry.add }).then(async (t) => {
        if (t.success) {
          await this._backgroundCheckService.getInviteApplicationFormChecks([this.dynamicForm.id]);
          this.toast.show('Form changes saved successfully');
        }
        else
          this.toast.show(t.message && t.message != '' ? t.message : 'something went wrong', { status: 'error' });
      }).catch(e => console.log(e));
    }
    else if (qry.update) {
      this._backgroundCheckService.UpdateApplicationFormChecks({ applicationFormId: this.dynamicForm.id, ...qry.update }).then(async (t) => {
        if (t.success) {
          await this._backgroundCheckService.getInviteApplicationFormChecks([this.dynamicForm.id]);
          this.toast.show('Form changes saved successfully');
        }
        else
          this.toast.show(t.message && t.message != '' ? t.message : 'something went wrong', { status: 'error' });
      }).catch(e => console.log(e));
    }
    else if (qry.reorder) {
      this._backgroundCheckService.ReorderApplicationFormChecks({ applicationFormId: this.dynamicForm.id, ...qry.reorder }).then(async (t) => {
        if (t.success) {
          await this._backgroundCheckService.getInviteApplicationFormChecks([this.dynamicForm.id]);
          this.toast.show('Form changes saved successfully');
        }
        else
          this.toast.show(t.message && t.message != '' ? t.message : 'something went wrong', { status: 'error' });
      }).catch(e => console.log(e));
    }
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

  /**
   * Temlate Methods
   */

  addNewStageAction(event: any) {
    this.sectionList.push({ id: 0, title: 'New Section', orderNo: this.sectionList.length + 1, subSections: [] });
    this.editableStageId = 0;
    this.isSubSectionSidebar = false;
    this.editableIdForStageSectionSidebar = 0;
    this.sidebarPosition = window.innerWidth / 2 > event.clientX ? 'end' : 'start';
  }

  editStageAction(event: any, stage: IStageList) {
    this.editableIdForStageSectionSidebar = stage.formStageId;
    this.isSubSectionSidebar = false;
    this.sidebarPosition = window.innerWidth / 2 > event.clientX ? 'end' : 'start';
  }

  deleteStageAction(stage: IStageList) {
    this.popup.show(YesNoPopupComponent, { bodyMessage: 'Are you sure you want to delete this section?' }).then(t => {
      if (!t.isConfirm) return;
      this.saveStageUpdate(CRUDOPERATION.Delete, stage.formStageId);
    });
  }

  addNewSectionAction(event: number = -1) {
    if (event == -1) return;
    this.setupSectionList(event);
    let secObject: SubSection = { id: 0, title: 'New Sub Section', orderNo: this.subSectionList.length + 1 , formFields: [] };
    this.subSectionList.push(secObject);
    this.editableSectionId = 0;
    this.editableIdForStageSectionSidebar = 0;
    this.isSubSectionSidebar = true;
  }

  editActionOnSection(formStageId: number = -1, formSectionId: number = -1) {
    if (formStageId == -1 || formSectionId == -1) return;
    this.setupSectionList(formStageId);
    this.editableIdForStageSectionSidebar = formSectionId;
    this.isSubSectionSidebar = true;
  }

  deleteActionOnSection(formSectionId: number = -1) {
    if (formSectionId == -1) return;
    this.popup.show(YesNoPopupComponent, { bodyMessage: 'Are you sure want to delete this sub-section?' }).then(t => {
      if (!t.isConfirm) return;
      let stageId: number = -1;
      this.dynamicForm.sections.forEach(section => {
        if (section.subSections.findIndex(x => x.id == formSectionId) == -1) return;
        stageId = section.subSections.length == 1 ? section.id : -1;
      });
      if (stageId > 0)
        this.saveStageUpdate(CRUDOPERATION.Delete, stageId);
      else
        this.saveSectionUpdate([{ opt: CRUDOPERATION.Delete, qry: formSectionId }]);
    });
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
    this.subSectionList = this.dynamicForm.sections.find(x => x.id == formStageId).subSections.map(subSection => ({
      id: subSection.id,
      title: subSection.title,
      orderNo: subSection.orderNo,
      formFields: []
    }));
  }

  /** Get Sidber Models */
  public getStageOrSectionModel(): IStageSidebarModel | ISectionSidebarModel {
    if (this.editableIdForStageSectionSidebar > -1) {
      if (this.isSubSectionSidebar) {
        let section = this.subSectionList.find(x => x.id == this.editableIdForStageSectionSidebar)
        return { formId: this.dynamicForm.id, sectionName: (this.editableIdForStageSectionSidebar > 0 && section && section.title) ? section.title : null, formStageId: section.id };
      }
      else {
        return { formId: this.dynamicForm.id, stageName: this.editableIdForStageSectionSidebar > 0 ? this.sectionList.find(x => x.id == this.editableIdForStageSectionSidebar).title : null };
      }
    }
    else return null;
  }

  public getDnDModelList() {
    let arr = this.dynamicForm.sections.find(x => x.id == this.currentDnDModelId).subSections.map(subSection => ({
      id: subSection.id,
      value: subSection.title,
      orderNo: subSection.orderNo
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

    let before = JSON.stringify(this.sectionList);

    const restrictedIDX = this.sectionList.findIndex(x => x.title.toLowerCase().includes('recruiter'))
    if (restrictedIDX != -1 && dropIndex >= restrictedIDX) {
      this.toast.show(`You cannot move position of the ${this.sectionList[restrictedIDX].title}`, { status: 'info' });
      return;
    }

    moveItemInArray(this.sectionList, dragIndex, dropIndex);
    if (before == JSON.stringify(this.sectionList)) return;
    const qry: ReorderQuery[] = this.sectionList.map((s, idx) => { return { id: s.id, orderNo: idx + 1 } });
    this.saveStageUpdate(CRUDOPERATION.Reorder, qry);
  }

  /*** CDK Ended Here ***/


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
          username.endsWith("@radixweb.com"))
      ) {
        return true;
      }
    }

    return false; // Default return for non-support users or missing data
  }

}
