import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RxToast } from '@rx/view';
import { FileService } from 'src/app/components/shared/services/file-services';
import { FieldsetService } from 'src/app/components/shared/services/fieldset.service';
import { ATSMappingResponse, Columns, DynamicForm, IntegrationLists, SubSection, Section } from 'src/app/view-modal/DynamicFormModel';
import { IFileUploadContainer, ILkpOptionArr, IPropList } from 'src/app/view-modal/GeneralModels';
import { getFieldsetPropertyList, InductionSection, InductionQuestion, OnboardedObjectTypes, prepareDynamicFormGroup, whitespaceValidator, inductionQuestion } from './fieldset-propertyList-functions';
import { IntegrationType, OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { DynamicFormService } from '../../dynamic-form.service';
import { FieldIntegrationService } from 'src/app/components/shared/services/field-integration.service';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';
import { SaveChangesModel } from 'src/app/view-modal/EditFormModels';
import { SidebarPropFormgroupComponent } from '../sidebar-prop-formgroup/sidebar-prop-formgroup.component';
declare var window: any;

type TicketNLicense = {
  labelName: string;
  atsPropertyValue?: string;
  addReferenceNo?: boolean;
  addExpiryDate?: boolean;
  addIssueDate?: boolean;
  addFrontDoc?: boolean;
  addBackDoc?: boolean;
}

@Component({
  selector: 'app-fieldset-sidebar',
  templateUrl: './fieldset-sidebar.component.html'
})
export class FieldsetSidebarComponent implements OnInit {

  /// As of now this is only used for Tickets & Licences
  /// If we need to use this for other fieldset categories then we need to make this dynamic
  onChildFilesContainerChanged(newFilesContainer: Array<IFileUploadContainer>) {
    this.filesContainer = newFilesContainer;
  }

  @Output() updateFieldsetPropChanges = new EventEmitter<{ isSuccess: boolean, qry: object }>();
  @ViewChild('childComp') childComponent: SidebarPropFormgroupComponent;

  @Input() dynamicForm !: DynamicForm;
  @Input() stage !: Section;
  @Input() section !: SubSection;
  @Input() field !: FormField;
  @Input() isAddFieldset: boolean;
  @Input() fieldsetCategory: number;
  @Input() formProperty: { applicationFormId: number };

  bsCanvas: any;

  filesContainer: Array<IFileUploadContainer> = [];
  propList: Array<IPropList> = [];
  isActiveTab: number = 0;
  isSaveEnabled: boolean = false;
  isLicenceSection: boolean = false;
  FieldsetSidebarForm: FormGroup;
  uniqueStr: string = "1";
  currentInductionSection: InductionSection;
  initialTicNlicenseValue: any;
  excludeAtsPropertyValue: string[] = [];
  isDependentDataChanges: boolean = false;
  allColumns: FormField[] = [];

  constructor(private fb: FormBuilder, private toast: RxToast, private fileService: FileService, private dynamicFormService: DynamicFormService, private fieldsetService: FieldsetService, private fieldIntegrationService: FieldIntegrationService) { }

  ngOnInit(): void {
    this.openCanvas();
  }

  openCanvas() {
    this.bsCanvas = new window.bootstrap.Offcanvas(document.getElementById('fieldsetSidebar'));
    this.setValuesToForm();
    if (this.propList.length > 0)
      this.bsCanvas.show();
    else this.cancelChanges();
  }

  private setValuesToForm() {
    //Clear all files
    this.filesContainer = [];

    this.allColumns = this.section.rows.flatMap((x) => x.columns);

    // set PopertyList
    this.propList = getFieldsetPropertyList(this.fieldsetCategory);

    this.excludeAtsPropertyValue = Array.from(new Set(
      this.fieldIntegrationService.columns
        .filter(column => column.atsPropertyValue && column.atsPropertyValue !== this.field?.atsPropertyValue)
        .map(column => column.atsPropertyValue)
    ));

    if (!this.isAddFieldset) {
      if (this.fieldsetCategory == 1) {
        this.propList.remove(this.propList.find(x => x.prop == 'bulkSkillDoc'));
      }
      if (this.fieldsetCategory == 2) {
        this.propList.remove(this.propList.find(x => x.prop == 'inductionType'));
      }
    }

    // SetupFormGroupOrModel
    this.setModelAndFormGroup();

  }


  ngAfterViewInit() {
    if (this.fieldsetCategory==1) {
      this.initialTicNlicenseValue=this.childComponent.intialFormValue;
    }
  }

  setModelAndFormGroup() {
    switch (this.fieldsetCategory) {
      case 1: // Tickets & Licences
        this.setModelAndFormGroupForTicketsNlicenses();
        this.isLicenceSection = true;
        switch (this.fieldIntegrationService.IntegrationInfo.integrationType) {
          case IntegrationType.Bullhorn:
            this.setIntegrationList(OnboardedObjects.LicencesandCertificates, false);
            break;
          default:
            this.setIntegrationList(OnboardedObjects.LicencesandCertificates);
            break;
        }
        break;
      case 2: // Induction Question
        this.setModelAndFormGroupForInduction();
        break;
    }
  }

  setModelAndFormGroupForTicketsNlicenses() {
    if (this.isAddFieldset) {
      this.FieldsetSidebarForm = this.fb.group({
        labelName: [null, [Validators.required, whitespaceValidator()]],
        addReferenceNo: [false],
        addExpiryDate: [false],
        addIssueDate: [false],
        addFrontDoc: [false],
        addBackDoc: [false],
        bulkSkillDoc: [null],
        isRequired: [false],
        atsPropertyValue: [null],
        custTypeForDependency: [null]
      });
    }
    else {

      let ticketNlicenseSet = this.getGroupFieldset(this.field.fieldGroupId);

      this.initialTicNlicenseValue = {
        labelName: this.field.labelName,
        atsPropertyValue: this.field.atsPropertyValue,
        addReferenceNo: ticketNlicenseSet.findIndex(col => col.objectType?.includes(OnboardedObjectTypes.referencenumber)) != -1,
        addExpiryDate: ticketNlicenseSet.findIndex(col => col.objectType?.includes(OnboardedObjectTypes.expirydate)) != -1,
        addIssueDate: ticketNlicenseSet.findIndex(col => col.objectType?.includes(OnboardedObjectTypes.issuedate)) != -1,
        addFrontDoc: ticketNlicenseSet.findIndex(col => col.objectType?.includes(OnboardedObjectTypes.frontdocument)) != -1,
        addBackDoc: ticketNlicenseSet.findIndex(col => col.objectType?.includes(OnboardedObjectTypes.backdocument)) != -1,
        isRequired: this.field.isRequired,
        custTypeForDependency:{}
      };      

      this.FieldsetSidebarForm = this.fb.group({
        labelName: [this.initialTicNlicenseValue.labelName, [Validators.required]],
        addReferenceNo: [this.initialTicNlicenseValue.addReferenceNo],
        addExpiryDate: [this.initialTicNlicenseValue.addExpiryDate],
        addIssueDate: [this.initialTicNlicenseValue.addIssueDate],
        addFrontDoc: [this.initialTicNlicenseValue.addFrontDoc],
        addBackDoc: [this.initialTicNlicenseValue.addBackDoc],
        atsPropertyValue: [this.initialTicNlicenseValue.atsPropertyValue],
        isRequired: [this.initialTicNlicenseValue.isRequired],
        custTypeForDependency: [null]
      });
    }


  }

  private async setIntegrationList(integrationType: OnboardedObjects, IsApplyFilter: boolean = true) {
    const localStorageKey = `Client_${this.dynamicForm.applicationFormInfo.clientId}`;
    let integrationList: IntegrationLists;

    const fetchIntegrationList = () => {
      this.dynamicFormService.getAtsMappings([integrationType]).subscribe((response: ATSMappingResponse) => {
        const property = "ticketsAndLicences";

        if (response[property].length > 0) {
          integrationList[property] = response[property];
          localStorage.setItem(localStorageKey, JSON.stringify(integrationList));

          if (IsApplyFilter) {
            let customFieldList: Array<{ id: number, value: string }> = [];
            customFieldList = response[property].filter(atsItem => !this.excludeAtsPropertyValue.includes(atsItem.id.toString()));
            this.setValueIntoPropList("atsPropertyValue", customFieldList);
          } else {
            this.setValueIntoPropList("atsPropertyValue", response[property]);
          }
        }
      });
    };

    integrationList = JSON.parse(localStorage.getItem(localStorageKey)) || { candidateList: [], skillList: [], documentTypeOrFolder: [], ticketsAndLicences: [], customFieldList: [] };

    const property = "ticketsAndLicences";

    if (integrationList[property].length > 0) {
      if (IsApplyFilter) {
        let customFieldList: Array<{ id: number, value: string }> = [];
        customFieldList = integrationList[property].filter(atsItem => !this.excludeAtsPropertyValue.includes(atsItem.id.toString()));
        this.setValueIntoPropList("atsPropertyValue", customFieldList);
      } else {
        this.setValueIntoPropList("atsPropertyValue", integrationList[property]);
      }
      // this.setValueIntoPropList("atsPropertyValue", integrationList[property]);
    } else {
      fetchIntegrationList();
    }
  }

  private setValueIntoPropList(objectProp: string, arrayList: Array<{ id: number, value: string }>) {
    let indexToSkillUpdate = this.propList.findIndex(obj => obj.prop == objectProp);
    if (indexToSkillUpdate !== -1) {
      this.propList[indexToSkillUpdate].attr.listArr = arrayList;
      this.FieldsetSidebarForm.get(objectProp).setValue(this.field ? this.field.atsPropertyValue : null);
    }
  }

  setModelAndFormGroupForInduction() {
    if (this.isAddFieldset) {
      this.FieldsetSidebarForm = this.fb.group({
        sectionName: [null, [Validators.required, whitespaceValidator()]],
        inductionType: ['simpleIndQueSet', [Validators.required]],
        videoUrl: [null, [Validators.required, whitespaceValidator()]],
        simpleIndQueSet: this.fb.array([prepareDynamicFormGroup(this.propList.find(x => x.prop == 'simpleIndQueSet').nestedProps)]),
        imageIndQueSet: this.fb.array([prepareDynamicFormGroup(this.propList.find(x => x.prop == 'imageIndQueSet').nestedProps)]),
        videoIndQueSet: this.fb.array([prepareDynamicFormGroup(this.propList.find(x => x.prop == 'videoIndQueSet').nestedProps)]),
      });
    }
    else {

      let fieldGroupId = undefined;

      this.currentInductionSection = {
        sectionName: this.section.sectionName,
        formStageId: this.dynamicForm.stages.find(stage => stage.sections.find(section => section.formSectionId == this.section.formSectionId)).formStageId,
        videoUrl: this.section?.videos[0]?.videoPath,
        inductionType: this.section.sectionKeyName.split('-')[1],
        inductionQuestion: []
      }

      this.section.rows.forEach(row => {
        row.columns.forEach(col => {
          if (col.fieldAnswer && col.objectType && col.objectType.toLowerCase().includes("inductionque")) {
            fieldGroupId = col.fieldGroupId;
            this.currentInductionSection.inductionQuestion.push({
              formFieldId: col.formFieldId,
              lookupViewId: col.lookupViewId,
              imagePath: col.imagePath,
              labelName: col.labelName,
              fieldOptions: {
                selectedOpt: Number(col.fieldAnswer),
                options: col.lookUps.map(opt => {
                  return {
                    id: opt.id,
                    value: opt.value
                  }
                })
              }
            });
          }
        })
      });

      this.FieldsetSidebarForm = this.fb.group({
        formSectionId: [this.section.formSectionId],
        sectionName: [this.currentInductionSection.sectionName, [Validators.required, whitespaceValidator()]],
        inductionType: [this.currentInductionSection.inductionType, [Validators.required]],
        fieldGroupId: [fieldGroupId],
        videoUrl: [this.currentInductionSection.videoUrl, [Validators.required, whitespaceValidator()]],
        videoId: [this.section?.videos[0]?.videoId],
        simpleIndQueSet: this.getIndQueSetGroup('simpleIndQueSet'),
        imageIndQueSet: this.getIndQueSetGroup('imageIndQueSet'),
        videoIndQueSet: this.getIndQueSetGroup('videoIndQueSet'),
      });
    }
  }

  /*** Get Edit Induction FormGroups Methods */
  getIndQueSetGroup(inductionType: string): FormArray {
    return (this.currentInductionSection.inductionType == inductionType) ? this.fb.array(this.currentInductionSection.inductionQuestion.map(q => {
      return this.fb.group({
        formFieldId: q.formFieldId,
        imagePath: [q.imagePath, (inductionType == 'imageIndQueSet') ? [Validators.required, whitespaceValidator()] : []],
        labelName: [q.labelName, (inductionType == 'simpleIndQueSet' || inductionType == 'videoIndQueSet') ? [Validators.required, whitespaceValidator()] : []],
        lookupViewId: [q.lookupViewId],
        fieldOptions: new FormGroup({
          selectedOpt: new FormControl(Number(q.fieldOptions.selectedOpt), Validators.required),
          options: new FormArray(q.fieldOptions.options.map((o, oIdx) => {
            return new FormGroup({
              id: new FormControl(o.id),
              value: new FormControl(o.value, [Validators.required, whitespaceValidator()])
            })
          }))
        }, inductionQuestion())
      });
    })) : this.fb.array([prepareDynamicFormGroup(this.propList.find(x => x.prop == inductionType).nestedProps)])
  }

  /** final Buttons */
  validateSave(): boolean {
    switch (this.fieldsetCategory) {
      case 1: // Tickets & Licences
        this.validateTicketNLicence();
        break;
      case 2: // Induction Question
        this.isSaveEnabled = this.validateInductionQuestion();
        break;
    }
    return this.isSaveEnabled;
  }

  validateInductionQuestion(): boolean {
    let inductionType = this.FieldsetSidebarForm.value.inductionType;
    return (this.FieldsetSidebarForm.dirty || (!this.isAddFieldset && this.currentInductionSection.inductionQuestion.length != this.FieldsetSidebarForm.value[inductionType].length)) && !(
      this.FieldsetSidebarForm.get("sectionName").invalid
      || (inductionType == 'videoIndQueSet' && this.FieldsetSidebarForm.get("videoUrl").invalid)
      || (inductionType == 'simpleIndQueSet' && this.FieldsetSidebarForm.get("simpleIndQueSet").invalid)
      || (inductionType == 'imageIndQueSet' && this.FieldsetSidebarForm.get("imageIndQueSet").invalid)
      || (inductionType == 'videoIndQueSet' && this.FieldsetSidebarForm.get("videoIndQueSet").invalid));
  }

  validateTicketNLicence(): void {
    if (this.isAddFieldset) {
      this.isSaveEnabled = (this.filesContainer.length > 0 || (this.FieldsetSidebarForm.get('labelName').valid))
    }
    else {
        var FormChange = Object.keys(this.initialTicNlicenseValue).some((key) =>
        JSON.stringify(this.FieldsetSidebarForm.value[key]) != JSON.stringify(this.initialTicNlicenseValue[key])
      );
      this.isSaveEnabled = FormChange && this.FieldsetSidebarForm.get("labelName").valid;
      if (this.childComponent) {
        this.validateDependency();
      }
    }
  }

  validateDependency() {
    const initialDependencyData = JSON.parse(
      JSON.stringify(this.childComponent.intialFormValue['custTypeForDependency'])
    );
    const formDepenedcyData = JSON.parse(
      JSON.stringify(this.FieldsetSidebarForm.value['custTypeForDependency'])
    );

    switch (true) {
      case this.childComponent.intialFormValue['custTypeForDependency'] == null:
      case JSON.stringify(initialDependencyData) ==
        JSON.stringify(formDepenedcyData):
        this.isDependentDataChanges = false;
        break;

      case formDepenedcyData &&
        formDepenedcyData['refFormFieldId'] &&
        formDepenedcyData['formFieldId'] &&
        formDepenedcyData['refValue'] &&
        'dependencyStatus' in formDepenedcyData &&
        formDepenedcyData['dependencyStatus']:
      case this.field.dependentFormFieldColumns.length > 0 &&
        formDepenedcyData &&
        'dependencyStatus' in formDepenedcyData &&
        !formDepenedcyData['dependencyStatus']:
        this.isDependentDataChanges = true;

        break;
      default:
        this.isDependentDataChanges = false;
        this.isSaveEnabled = false;

    }

  }

  async saveChanges() {
    let result: { isSuccess: boolean, qry: object } = null;
    switch (this.fieldsetCategory) {
      case 1: // Tickets & Licences
        result = await this.saveTicketNLicence();
        break;
      case 2: // Induction Question
        result = this.saveInductionQuestion();
        break;
    }
    
    this.updateFieldsetPropChanges.emit(result);
    this.bsCanvas.hide();
  }



  saveInductionQuestion(): { isSuccess: boolean, errMsg: string | null, qry: object } {
    if (this.isAddFieldset) {

      return this.fieldsetService.processInductionQuestion(this.stage.formStageId, this.FieldsetSidebarForm);
    }
    else {
      return this.fieldsetService.processupdatedInductionQuestion(this.currentInductionSection, this.FieldsetSidebarForm);
    }
  }

  async saveTicketNLicence(): Promise<{ isSuccess: boolean, qry: object }> {
    if (!this.isAddFieldset) {
      let obj: { labelName: string, atsPropertyValue: string, isRequired:boolean, ADD: string[], DEL: string[] } = {
        labelName: this.FieldsetSidebarForm.value.labelName,
        atsPropertyValue: this.FieldsetSidebarForm.value.atsPropertyValue,
        isRequired: this.FieldsetSidebarForm.value.isRequired,
        ADD: [],
        DEL: []
      };

      Object.keys(this.initialTicNlicenseValue).forEach(key => {
        if (this.FieldsetSidebarForm.value[key] !== this.initialTicNlicenseValue[key]) {
          if (["addReferenceNo", "addExpiryDate", "addIssueDate", "addBackDoc", "addFrontDoc"].includes(key)){
            if (this.FieldsetSidebarForm.value[key])
            {
              obj.ADD.push(key);
            }
            else
              obj.DEL.push(key); 
          }
        }
      });

      
      if (obj.ADD.length == 0 && obj.DEL.length == 0 && obj.labelName == this.initialTicNlicenseValue.labelName && obj.atsPropertyValue == this.initialTicNlicenseValue.atsPropertyValue && obj.isRequired == this.initialTicNlicenseValue.isRequired) {
        if (this.isDependentDataChanges) {     
          const newData = await this.saveDependencyChanges(); // Await async operation
          return { isSuccess: newData.isSuccess, qry: null };
        }else{          
          this.toast.show("No Changes Made!", { status: 'error' });
          return { isSuccess: false, qry: null };
        }
      }

      let res = (this.fieldsetService.updateSingleTicketNLicence(this.section.formSectionId, obj, this.getGroupFieldset(this.field.fieldGroupId), this.section.rows.at(-1).columns.at(-1).tabIndex));

      if (this.isDependentDataChanges) {
        const newData = await this.saveDependencyChanges(); // Await async operation
        if (newData.isSuccess) {
          return { isSuccess: true, qry: res.qry };
        }else{
          return { isSuccess: false, qry: null };
        }        
      }
      
      return { isSuccess: true, qry: res.qry };
    }

    let processedData = null;
    if (this.filesContainer.length > 0) {
      processedData = this.fieldsetService.processBulkTicketNLicence(this.filesContainer[0].fileData.base64Data, this.section.formSectionId, this.section.rows.at(-1).columns.at(-1).tabIndex + 1, this.FieldsetSidebarForm.value.isRequired);
    }
    else {
      processedData = this.fieldsetService.processSingleTicketNLicence(this.section.formSectionId, this.FieldsetSidebarForm, this.section.rows.at(-1).columns.at(-1).tabIndex + 1);
    }
    if (!processedData.isSuccess) {
      this.toast.show(processedData.errMsg, { status: 'error' });
      return { isSuccess: false, qry: null };
    }
    return { isSuccess: true, qry: processedData.qry };
  }

  cancelChanges() {
    this.updateFieldsetPropChanges.emit({ isSuccess: false, qry: null });
    this.bsCanvas.hide();
  }

  /*** Fieldset Methods also defined in formView Component */
  private getFormFields() {
    return this.dynamicForm.stages.map(stage => stage.sections.map(section => section.rows.map(row => row.columns))).flat(3);
  }

  private getGroupFieldset(fieldGroupId: number) {
    return this.getFormFields().filter(x => x.fieldGroupId == fieldGroupId);
  }


  private async saveDependencyChanges() {
    if (!this.isDependentDataChanges) return;
    // api call
    let data = this.FieldsetSidebarForm.value['custTypeForDependency'];

    let qry: object = {};

    if (this.getControlType(data['refFormFieldId']) == FieldTypeEnum.SwitchCheckBox) {
      data['refValue'] = data['refValue'] == "45" ? "true" : data['refValue'];
    }

    if (data['dependencyStatus'] && this.field.dependentFormFieldColumns.length <= 0) {
      qry['add'] = data;
    }
    else if (!data['dependencyStatus']) {
      data['refFormFieldId'] = this.field.dependentFormFieldColumns[0].refFormFieldId;
      data['refValue'] = this.field.dependentFormFieldColumns[0].refValue.toString();
      qry['delete'] = data;
    } else {
      qry['update'] = data;
    }

    let payload: SaveChangesModel = {
      applicationFormId: this.formProperty.applicationFormId,
      query: JSON.stringify(qry),
      isPDFChangeRequired: false,
    };
    console.log(payload);

    const result = await this.dynamicFormService.postSaveDependencyUpdates(payload);
    console.log(`dependency-response`, result, payload);

    if (!result.isSuccess) {
      this.isDependentDataChanges = false;
      this.toast.show(result.message, { status: 'error' });
      return { isSuccess: result.isSuccess, qry: null };
    } else {
      return { isSuccess: result.isSuccess, qry: qry } ;
    }
  }

  private getControlType(refFormFieldId: number): FieldTypeEnum {
    return FieldTypeEnum[this.allColumns
      .find(column => column.formFieldId === refFormFieldId)
      .controlType];
  }



}
