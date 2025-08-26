import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RxToast } from '@rx/view';
import { FileService } from 'src/app/components/shared/services/file-services';
import { FieldsetService } from 'src/app/components/shared/services/fieldset.service';
import { IFileUploadContainer, IPropList } from 'src/app/view-modal/GeneralModels';
import { CheckCategories, getUBCPropertyList, IBackgorundCheck, ICheckProperties, IIntegrationMapping, Questionnaire } from './backgroundcheck-propertyList-functions';
import { DynamicFormService } from '../../dynamic-form.service';
import { FieldIntegrationService } from 'src/app/components/shared/services/field-integration.service';
import { SidebarPropFormgroupComponent } from '../sidebar-prop-formgroup/sidebar-prop-formgroup.component';
import { BackgroundCheckService } from '../../background-check.service';
import { prepareDynamicFormGroup, whitespaceValidator } from '../fieldset-sidebar/fieldset-propertyList-functions';
import { IntegrationType, OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { ATSMappingResponse, DynamicForm, IntegrationLists } from 'src/app/view-modal/DynamicFormModel';
import { FieldTypeEnum } from '../../../../Enums/FieldType.enum';
declare var window: any;

@Component({
  selector: 'app-backgroundcheck-sidebar',
  templateUrl: './backgroundcheck-sidebar.component.html'
})
export class BackgroundCheckSidebarComponent implements OnInit {

  /// As of now this is only used for Tickets & Licences
  /// If we need to use this for other fieldset categories then we need to make this dynamic
  onChildFilesContainerChanged(newFilesContainer: Array<IFileUploadContainer>) {
    this.filesContainer = newFilesContainer;
  }

  @Output() updateBackgroundCheckPropChanges = new EventEmitter<{ isNewAndCanceled?: boolean, isSuccess: boolean, qry: object }>();
  @ViewChild('childComp') childComponent: SidebarPropFormgroupComponent;

  @Input() isAddBackgroundCheckSidebar: boolean = false;
  @Input() checkCategory: number = 0;
  @Input() formProperty: { applicationFormId: number };
  @Input() dynamicForm !: DynamicForm;

  bsCanvas: any;
  filesContainer: Array<IFileUploadContainer> = [];
  propList: Array<IPropList> = [];
  isActiveTab: number = 0;
  tabsToShow: string[] = ['Settings'];
  isSaveEnabled: boolean = false;
  isIntegrationTabAvailable: boolean = false;
  isLicenceSection: boolean = false;
  backgroundCheckSidebarForm: FormGroup = new FormGroup({
    lableName: new FormControl('', [Validators.required, whitespaceValidator])
  });

  refereeQuestionnairesFormList: {
    employmentQuestionnaires: Questionnaire[],
    academicQuestionnaires: Questionnaire[],
    personalQuestionnaires: Questionnaire[]
  } = {
      employmentQuestionnaires: [],
      academicQuestionnaires: [],
      personalQuestionnaires: []
    };

  uniqueStr: string = "1";

  currentCheck: IBackgorundCheck = null;


  constructor(
    public _backgroundCheckService: BackgroundCheckService,
    private toast: RxToast,
    private dynamicFormService: DynamicFormService,
    private fieldIntegrationService: FieldIntegrationService
  ) { }

  ngOnInit(): void {
    this.isIntegrationTabAvailable = [
      IntegrationType.Bullhorn.toString(),
      IntegrationType.Vincere.toString(),
      IntegrationType.ARCRM.toString(),
      IntegrationType.JobAdder.toString(),
      IntegrationType.FastTrack.toString(),
      IntegrationType.CodeHouse.toString()
    ].includes(this.fieldIntegrationService.IntegrationInfo.integrationType);
    this.openCanvas();


  }

  openCanvas() {
    this.bsCanvas = new window.bootstrap.Offcanvas(document.getElementById('backgroundCheckSidebar'));
    this.setValuesToForm();
    if (this.propList)
      this.bsCanvas.show();
  }

  private setValuesToForm() {

    if (this.isIntegrationTabAvailable) {
      this.tabsToShow.push('Integration');
    }

    //Clear all files
    this.filesContainer = [];

    // set check control
    this.currentCheck = this._backgroundCheckService.getCheckControlList(this.checkCategory);

    // set PopertyList
    this.propList = getUBCPropertyList(this.currentCheck.name);

    if (this.fieldIntegrationService.IntegrationInfo.integrationType != 'ARCRM') {
      this.propList = this.propList.filter(x => x.prop != 'arcrmCompliance' && x.prop != 'arcrmAttribute')
    }
    else {
      this.propList = this.propList.map(x => x.prop == 'atsPropertyValue' && this.fieldIntegrationService.IntegrationInfo.integrationType == IntegrationType.ARCRM ? { ...x, propLabel: 'Template Type' } : x);
    }

    if (this.fieldIntegrationService.IntegrationInfo.integrationType != 'FastTrack') {
      this.propList = this.propList.filter(x => x.prop != 'fasttrackSkills')
    }
    if(this.fieldIntegrationService.IntegrationInfo.integrationType.toLowerCase() == 'codehouse') {
      this.propList = this.propList.filter(x =>x.prop != 'atsPropertyValue')
    }
    if(this.currentCheck.name == 'ReferenceCheck'){
      this._backgroundCheckService.getQuestionnairesForms()
        .then((data) => {
          this.refereeQuestionnairesFormList.employmentQuestionnaires = data?.filter(q => q?.subFormType == 1);
          this.refereeQuestionnairesFormList.academicQuestionnaires = data?.filter(q => q?.subFormType == 2);
          this.refereeQuestionnairesFormList.personalQuestionnaires = data?.filter(q => q?.subFormType == 3);

          for (let i = 0; i < this.propList.length; i++) {
            if (this.propList[i].prop == 'refereeQuestionnaire') {
              this.propList[i].attr.listArr = this.refereeQuestionnairesFormList.employmentQuestionnaires.map((q) => {
                return {
                  id: q.applicationFormId,
                  value: q.applicationFormName
                }
              });
            }
            else if (this.propList[i].prop == 'refereeAcademicQuestionnaire') {
              this.propList[i].attr.listArr = this.refereeQuestionnairesFormList.academicQuestionnaires.map((q) => {
                return {
                  id: q.applicationFormId,
                  value: q.applicationFormName
                }
              });
            }
            else if (this.propList[i].prop == 'refereePersonalQuestionnaire') {
              this.propList[i].attr.listArr = this.refereeQuestionnairesFormList.personalQuestionnaires.map((q) => {
                return {
                  id: q.applicationFormId,
                  value: q.applicationFormName
                }
              });
            }
          }
          this.setModelAndFormGroup();
        })
        .catch((err) => {
          console.error('Error:', err);
        });
    }

    this.setModelAndFormGroup();
  }

  setModelAndFormGroup() {
    this.backgroundCheckSidebarForm = prepareDynamicFormGroup(this.propList);

    if (this.isIntegrationTabAvailable) {
      this.backgroundCheckSidebarForm.get('integrateTo')?.valueChanges?.subscribe((value) => {
        const atsPropertyValueControl = this.backgroundCheckSidebarForm.get('atsPropertyValue');
        const documentNamecontrol = this.backgroundCheckSidebarForm.get('documentName');
        if (value === 1) {
          if(this.fieldIntegrationService.IntegrationInfo.integrationType != 'CodeHouse')
          {
          atsPropertyValueControl.setValidators([Validators.required]);
          }
          documentNamecontrol.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9()_\-&|]+( +[a-zA-Z0-9()_\-&|]+)*$/)]);
          if (!documentNamecontrol.value) {
            documentNamecontrol.setValue(this.currentCheck.displayName);
          }
        } else {
          atsPropertyValueControl.clearValidators();
          documentNamecontrol.clearValidators();
        }
        atsPropertyValueControl.updateValueAndValidity();
        documentNamecontrol.updateValueAndValidity();
      });
    }

    if (this.currentCheck.name == CheckCategories().ReferenceCheck) {
      this.trueFalseValidatorSetter('isMaxGapRequired', 'maxGap', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)]);

      this.trueFalseValidatorSetter('allowedEmploymentReferences', 'minEmploymentReferences', []);
      this.trueFalseValidatorSetter('allowedEmploymentReferences', 'refereeQuestionnaire', [Validators.required]);

      this.trueFalseValidatorSetter('allowedAcademicReferences', 'minAcademicReferences', []);
      this.trueFalseValidatorSetter('allowedAcademicReferences', 'refereeAcademicQuestionnaire', [Validators.required]);

      this.trueFalseValidatorSetter('allowedPersonalReferences', 'minPersonalReferences', []);
      this.trueFalseValidatorSetter('allowedPersonalReferences', 'refereePersonalQuestionnaire', [Validators.required]);
    }

    this.backgroundCheckSidebarForm.patchValue(this.currentCheck.additionalProps);
    let reportMapping = this.currentCheck?.additionalProps?.integrationMappings?.find(x => x.key == 'report');
    if (reportMapping) {
      this.backgroundCheckSidebarForm.patchValue(reportMapping);
      // if(this.fieldIntegrationService.IntegrationInfo.integrationType == IntegrationType.ARCRM.toString()) {
      //   let atsPropertyValue = reportMapping.atsPropertyValue;
      //   if(atsPropertyValue != null && atsPropertyValue != '' && atsPropertyValue.includes(':')) {
      //     this.backgroundCheckSidebarForm.patchValue({atsPropertyValue : atsPropertyValue.split(':')[0], arcrmCompliance: atsPropertyValue.split(':')[1]})
      //   }
      // }
    }
    else {
      let integrateTo = 1;
      let documentName = this.currentCheck.displayName;
      this.backgroundCheckSidebarForm.patchValue({ integrateTo: integrateTo, documentName: documentName })
    }

    let attributeMapping = this.currentCheck?.additionalProps?.integrationMappings?.find(x => x.key == 'attribute');
    if (attributeMapping) {
      // let atsPropertyValue = attributeMapping.atsPropertyValue;
      // if(atsPropertyValue != null && atsPropertyValue != '' && atsPropertyValue.includes(':')) {
      //   this.backgroundCheckSidebarForm.patchValue({arcrmAttribute : atsPropertyValue.split(':')[0], arcrmCompliance: atsPropertyValue.split(':')[1]})
      // }
      // else {
      // this.backgroundCheckSidebarForm.patchValue({arcrmAttribute: attributeMapping.atsPropertyValue});
      // }
      this.backgroundCheckSidebarForm.patchValue({ arcrmAttribute: attributeMapping.atsPropertyValue });
    }

    let skillMapping = this.currentCheck?.additionalProps?.integrationMappings?.find(x => x.key == 'skill');
    if (skillMapping) {
      this.backgroundCheckSidebarForm.patchValue({ fasttrackSkills: skillMapping.atsPropertyValue });
    }

    this.setIntegrationList();
    // if(this.fieldIntegrationService.IntegrationInfo.integrationType == IntegrationType.ARCRM.toString()) {
    //   this.setARCRMComplianceIntegrationList();
    // }
  }

  private trueFalseValidatorSetter(dependentOnPropName: string, dependentPropName: string, validators: ValidatorFn[]) {
    this.backgroundCheckSidebarForm?.get(dependentOnPropName)?.valueChanges?.subscribe((value) => {
      if (value) {
        this.backgroundCheckSidebarForm?.get(dependentPropName)?.setValidators(validators);
      }
      else {
        this.backgroundCheckSidebarForm?.get(dependentPropName)?.patchValue(null);
        this.backgroundCheckSidebarForm?.get(dependentPropName)?.clearValidators();
      }
      this.backgroundCheckSidebarForm.get(dependentPropName).updateValueAndValidity();
    });
  }

  // private async setIntegrationList() {
  //   const localStorageKey = `Client_${this.dynamicForm.applicationFormInfo.clientId}`;

  //   let integrationList: IntegrationLists;
  //   let integrationType: OnboardedObjects | null = null;

  //   switch (this.fieldIntegrationService.IntegrationInfo.integrationType) {
  //     case IntegrationType.Bullhorn:
  //       integrationType = OnboardedObjects.LicencesandCertificates;
  //       break;
  //     case IntegrationType.Vincere:
  //     case IntegrationType.ARCRM:
  //       integrationType = OnboardedObjects.Documents;
  //       break;
  //   }

  //   const property = this.getPropertyByIntegrationType(integrationType);

  //   const fetchIntegrationList = () => {
  //     this.dynamicFormService.getAtsMappings([integrationType]).subscribe((response: ATSMappingResponse) => {
  //       if (response[property].length > 0) {
  //         integrationList[property] = response[property];
  //         localStorage.setItem(localStorageKey, JSON.stringify(integrationList));
  //         this.setValueIntoPropList("atsPropertyValue", response[property]);
  //       }
  //     });
  //   };

  //   integrationList = JSON.parse(localStorage.getItem(localStorageKey)) || { candidateList: [], skillList: [], documentTypeOrFolder: [], ticketsAndLicences: [], customFieldList: [] };

  //   if (integrationList[property].length > 0) {
  //     this.setValueIntoPropList("atsPropertyValue", integrationList[property]);
  //   } else {
  //     fetchIntegrationList();
  //   }
  // }

  private async setIntegrationList() {
    const localStorageKey = `Client_${this.dynamicForm.applicationFormInfo.clientId}`;
    let integrationList: IntegrationLists = JSON.parse(localStorage.getItem(localStorageKey)) || {
      candidateList: [], skillList: [], documentTypeOrFolder: [], ticketsAndLicences: [], customFieldList: []
    };

    let integrationTypes: OnboardedObjects[] = [];

    switch (this.fieldIntegrationService.IntegrationInfo.integrationType) {
      case IntegrationType.Bullhorn:
        integrationTypes = [OnboardedObjects.LicencesandCertificates];
        break;
      case IntegrationType.Vincere:
        integrationTypes = [OnboardedObjects.Documents];
        break;
      case IntegrationType.JobAdder:
        integrationTypes = [OnboardedObjects.Documents];
        break;
      case IntegrationType.ARCRM:
        integrationTypes = [OnboardedObjects.Documents, OnboardedObjects.Skills]; // ARCRM needs both
        break;
      case IntegrationType.FastTrack:
        integrationTypes = [OnboardedObjects.Documents, OnboardedObjects.Skills];
        break;
    }

    for (const type of integrationTypes) {
      const property = this.getPropertyByIntegrationType(type);
      const propKey = this.getPropKey(this.fieldIntegrationService.IntegrationInfo.integrationType, type);

      // If data exists in local storage, use it directly
      if (integrationList[property]?.length > 0) {
        this.setValueIntoPropList(propKey, integrationList[property]);
      } else {
        // Fetch data only if missing
        this.dynamicFormService.getAtsMappings([type]).subscribe((response: ATSMappingResponse) => {
          if (response[property]?.length > 0) {
            integrationList[property] = response[property];
            localStorage.setItem(localStorageKey, JSON.stringify(integrationList));
            this.setValueIntoPropList(propKey, response[property]);
          }
        });
      }
    }
  }

  // private setARCRMComplianceIntegrationList(AllowedDatatype: string[] = [], propLabel?: string, IsApplyFilter: boolean = true) {
  //   const localStorageKey = `Client_${this.dynamicForm.applicationFormInfo.clientId}`;
  //     let integrationList: IntegrationLists = JSON.parse(localStorage.getItem(localStorageKey)) || {
  //       candidateList: [], skillList: [], documentTypeOrFolder: [], ticketsAndLicences: [], customFieldList: [], complianceList: []
  //     };

  //     let integrationTypes: OnboardedObjects[] = [OnboardedObjects.Skills];


  //     for (const type of integrationTypes) {
  //       const property = 'complianceList';
  //       const propKey = 'arcrmCompliance';

  //       // If data exists in local storage, use it directly
  //       if (integrationList[property]?.length > 0) {
  //         this.setValueIntoPropList(propKey, integrationList[property]);
  //       } else {
  //         // Fetch data only if missing
  //         this.dynamicFormService.getAtsMappings([type]).subscribe((response: ATSMappingResponse) => {
  //           if (response[property]?.length > 0) {
  //             integrationList[property] = response[property];
  //             localStorage.setItem(localStorageKey, JSON.stringify(integrationList));
  //             this.setValueIntoPropList(propKey, response[property]);
  //           }
  //         });
  //       }
  //     }
  // }


  private getPropKey(integrationType: string, type: OnboardedObjects) {
    switch (integrationType) {
      case IntegrationType.ARCRM:
        switch (type) {
          case OnboardedObjects.Skills:
            return "arcrmAttribute";
          default:
            return "atsPropertyValue";
        }
      case IntegrationType.FastTrack:
        switch (type) {
          case OnboardedObjects.Skills:
            return "fasttrackSkills";
          default:
            return "atsPropertyValue";
        }
      default:
        return "atsPropertyValue";
    }
  }


  private getPropertyByIntegrationType(integrationType: OnboardedObjects): keyof IntegrationLists {
    switch (integrationType) {
      case OnboardedObjects.Skills:
        return 'skillList';
      case OnboardedObjects.Documents:
        return 'documentTypeOrFolder';
      case OnboardedObjects.CustomFields: // Assuming CustomField is added to OnboardedObjects
        return 'customFieldList';
      case OnboardedObjects.Candidate: // Assuming CustomField is added to OnboardedObjects
        return 'candidateList';
      case OnboardedObjects.LicencesandCertificates: // Assuming CustomField is added to OnboardedObjects
        return 'ticketsAndLicences';
      default:
        throw new Error(`Unsupported integration type: ${integrationType}`);
    }
  }

  private setValueIntoPropList(objectProp: string, arrayList: Array<{ id: number, value: string }>) {
    let indexToSkillUpdate = this.propList.findIndex(obj => obj.prop == objectProp);
    if (indexToSkillUpdate !== -1) {
      this.propList[indexToSkillUpdate].attr.listArr = arrayList;
    }
  }


  /** final Buttons */
  validateSave(): boolean {
    this.isSaveEnabled = (this.isAddBackgroundCheckSidebar || this.backgroundCheckSidebarForm.dirty) && this.backgroundCheckSidebarForm.valid;
    return this.isSaveEnabled;
  }

  async saveChanges() {
    let result: { isSuccess: boolean, qry: object } = null;

    let newAdditionalProps: ICheckProperties = {
      checkDeclaration: this.backgroundCheckSidebarForm?.value?.checkDeclaration,
      btnText: this.backgroundCheckSidebarForm?.value?.btnText,

      startCheckOnCandidateSubmit: this.backgroundCheckSidebarForm?.value?.startCheckOnCandidateSubmit,
      workHistoryStatement: this.backgroundCheckSidebarForm?.value?.workHistoryStatement,
      minYears: this.backgroundCheckSidebarForm?.value?.minYears,
      minEmployments: this.backgroundCheckSidebarForm?.value?.minEmployments,
      isMaxGapRequired: this.backgroundCheckSidebarForm?.value?.isMaxGapRequired,
      maxGap: this.backgroundCheckSidebarForm?.value?.maxGap,
      minReferences: this.backgroundCheckSidebarForm?.value?.minReferences,
      minReferenceYears: this.backgroundCheckSidebarForm?.value?.minReferenceYears,

      allowedEmploymentReferences: this.backgroundCheckSidebarForm?.value?.allowedEmploymentReferences,
      minEmploymentReferences: this.backgroundCheckSidebarForm?.value?.minEmploymentReferences,
      refereeQuestionnaire: this.backgroundCheckSidebarForm?.value?.refereeQuestionnaire,

      allowedAcademicReferences: this.backgroundCheckSidebarForm?.value?.allowedAcademicReferences,
      minAcademicReferences: this.backgroundCheckSidebarForm?.value?.minAcademicReferences,
      refereeAcademicQuestionnaire: this.backgroundCheckSidebarForm?.value?.refereeAcademicQuestionnaire,

      allowedPersonalReferences: this.backgroundCheckSidebarForm?.value?.allowedPersonalReferences,
      minPersonalReferences: this.backgroundCheckSidebarForm?.value?.minPersonalReferences,
      refereePersonalQuestionnaire: this.backgroundCheckSidebarForm?.value?.refereePersonalQuestionnaire,

      isMrzCheckRequired: this.backgroundCheckSidebarForm?.value?.isMrzCheckRequired,
      dbsUpdateService: this.backgroundCheckSidebarForm?.value?.dbsUpdateService,
      candidatePay: this.backgroundCheckSidebarForm?.value?.candidatePay,
      includeHandlingFees: this.backgroundCheckSidebarForm?.value?.includeHandlingFees,

      sendEmailOnComplete: this.backgroundCheckSidebarForm?.value?.sendEmailOnComplete,
    }

    if (this.backgroundCheckSidebarForm?.value?.isMaxGapRequired == false) {
      newAdditionalProps.maxGap = null;
    }

    let newIntegrationMappings: Array<IIntegrationMapping> = (this.currentCheck?.additionalProps?.integrationMappings) ?? [];
    let reportMappingIndex = newIntegrationMappings.findIndex(x => x.key === 'report');
    if (this.backgroundCheckSidebarForm.value['integrateTo'] == 1) {
      if ([
        IntegrationType.Bullhorn.toString(),
        IntegrationType.Vincere.toString(),
        IntegrationType.ARCRM.toString(),
        IntegrationType.JobAdder.toString(),
        IntegrationType.FastTrack.toString(),
        IntegrationType.CodeHouse.toString()
      ].includes(this.fieldIntegrationService.IntegrationInfo.integrationType)) {
        let documentName = this.backgroundCheckSidebarForm.value['documentName'];
        if (!documentName) documentName = null;
        let atsPropertyValue = this.backgroundCheckSidebarForm.value['atsPropertyValue'];
        if (!atsPropertyValue) atsPropertyValue = null;
        let addMonthsToExpiryDate = this.backgroundCheckSidebarForm.value['addMonthsToExpiryDate'];
        if (!addMonthsToExpiryDate || addMonthsToExpiryDate == "null") {
          addMonthsToExpiryDate = null;
        }
        let attributeId = this.backgroundCheckSidebarForm.value['arcrmAttribute'];
        if (!attributeId || attributeId == "null") {
          attributeId = null;
        }

        let skillId = this.backgroundCheckSidebarForm.value['fasttrackSkills'];
        if (!skillId || skillId == "null") {
          skillId = null;
        }

        // let complianceId = this.backgroundCheckSidebarForm.value['arcrmCompliance'];
        // if(!complianceId || complianceId == "null") {
        //   complianceId = null;
        // }

        let atsPropertyId: number = 0;
        let objectType: number = 0;

        let attributeATSPropertyId: number = 0;
        let attributeObjectType: number = 0;

        let skillATSPropertyId: number = 0;
        let skillObjectType: number = 0;


        switch (this.fieldIntegrationService.IntegrationInfo.integrationType) {
          case IntegrationType.Bullhorn:
            {
              let atsProperty = this.dynamicForm.atsProperties.find(x => x.apiProperty == "credentials");
              if (atsProperty) {
                atsPropertyId = atsProperty.atsPropertyId;
                objectType = atsProperty.objectType;
              }
            }
            break;
          case IntegrationType.Vincere:
            {
              let atsProperty = this.dynamicForm.atsProperties.find(x => x.apiProperty == "document");
              if (atsProperty) {
                atsPropertyId = atsProperty.atsPropertyId;
                objectType = atsProperty.objectType;
              }
            }
            break;
          case IntegrationType.JobAdder:
            {
              let atsProperty = this.dynamicForm.atsProperties.find(x => x.apiProperty == "document");
              if (atsProperty) {
                atsPropertyId = atsProperty.atsPropertyId;
                objectType = atsProperty.objectType;
              }
            }
            break;
          case IntegrationType.ARCRM:
            {
              let atsProperty = this.dynamicForm.atsProperties.find(x => x.apiProperty == "Documents");
              if (atsProperty) {
                atsPropertyId = atsProperty.atsPropertyId;
                objectType = atsProperty.objectType;
              }

              let attributeATSProperty = this.dynamicForm.atsProperties.find(x => x.apiProperty == "Attributes");
              if (attributeATSProperty) {
                attributeATSPropertyId = attributeATSProperty.atsPropertyId;
                attributeObjectType = attributeATSProperty.objectType;
              }
            }
            break;
          case IntegrationType.FastTrack:
            {
              let atsProperty = this.dynamicForm.atsProperties.find(x => x.apiProperty == "document" && x.objectType == 121);
              if (atsProperty) {
                atsPropertyId = atsProperty.atsPropertyId;
                objectType = atsProperty.objectType;
              }
              let skillATSProperty = this.dynamicForm.atsProperties.find(x => x.atsLabel == "Skill" && x.objectType == 115);
              if (skillATSProperty) {
                skillATSPropertyId = skillATSProperty.atsPropertyId;
                skillObjectType = skillATSProperty.objectType;
              }
            }
            break;
            case IntegrationType.CodeHouse:
            {
              let atsProperty = this.dynamicForm.atsProperties.find(x => x.apiProperty == "document" && x.objectType == 121);
              if (atsProperty) {
                atsPropertyId = atsProperty.atsPropertyId;
                objectType = atsProperty.objectType;
              }
            }
            break;
        }

        // if(complianceId && complianceId != null && complianceId != '') {
        //   if(atsPropertyValue && atsPropertyValue != null && atsPropertyValue != '') {
        //   atsPropertyValue = atsPropertyValue + ':' + complianceId;
        //   }

        //   if(attributeId && attributeId != null && attributeId != '') {
        //     attributeId = attributeId + ':' + complianceId;
        //   }
        // }

        if ((this.fieldIntegrationService.IntegrationInfo.integrationType == "CodeHouse" && (!atsPropertyId || !objectType)) ||
    (this.fieldIntegrationService.IntegrationInfo.integrationType != "CodeHouse" && (!atsPropertyValue || !atsPropertyId || !objectType))) {
          // if data going to be updated is not valid
          // do not update anything
          this.toast.show('Something went wrong', { status: 'error' });
          return;
        }
        else {
          // if data is valid
          let newReportMapping: IIntegrationMapping = {
            key: 'report',
            integrateTo: 1,
            dataType: FieldTypeEnum.SingleFileUpload,
            atsPropertyId: atsPropertyId,
            objectName: objectType?.toString(),
            documentName: documentName,
            atsPropertyValue: atsPropertyValue,
            addMonthsToExpiryDate: addMonthsToExpiryDate,
          }

          if (reportMappingIndex !== -1) {
            // Remove the currentReportMapping
            newIntegrationMappings.splice(reportMappingIndex, 1);
          }
          // Insert the new reportMapping
          newIntegrationMappings.push(newReportMapping);

          if (this.fieldIntegrationService.IntegrationInfo.integrationType == IntegrationType.ARCRM) {
            let attributeMapping: IIntegrationMapping = {
              key: 'attribute',
              integrateTo: 1,
              dataType: FieldTypeEnum.RadioButton,
              atsPropertyId: attributeATSPropertyId,
              objectName: attributeObjectType?.toString(),
              documentName: documentName,
              atsPropertyValue: attributeId,
              addMonthsToExpiryDate: addMonthsToExpiryDate,
            }

            let attributeMappingIndex = newIntegrationMappings.findIndex(x => x.key == 'attribute');
            if (attributeMappingIndex !== -1) {
              newIntegrationMappings.splice(attributeMappingIndex, 1);
            }

            if (attributeId != null && attributeATSPropertyId != null && attributeObjectType != null) {
              newIntegrationMappings.push(attributeMapping);
            }
          }
        }
      }
    }
    else {

      let newReportMapping: IIntegrationMapping = {
        key: 'report',
        integrateTo: 3,
        dataType: null,
        atsPropertyId: null,
        objectName: null,
        documentName: null,
        atsPropertyValue: null,
        addMonthsToExpiryDate: null,

      }

      if (reportMappingIndex !== -1) {
        // Remove the currentReportMapping
        newIntegrationMappings.splice(reportMappingIndex, 1);
      }

      // Insert the new reportMapping
      newIntegrationMappings.push(newReportMapping);

      if (this.fieldIntegrationService.IntegrationInfo.integrationType == IntegrationType.ARCRM) {
        let attributeMapping: IIntegrationMapping = {
          key: 'attribute',
          integrateTo: 3,
          dataType: null,
          atsPropertyId: null,
          objectName: null,
          documentName: null,
          atsPropertyValue: null,
          addMonthsToExpiryDate: null,
        }

        let attributeMappingIndex = newIntegrationMappings.findIndex(x => x.key == 'attribute');
        if (attributeMappingIndex !== -1) {
          newIntegrationMappings.splice(attributeMappingIndex, 1);
        }
        newIntegrationMappings.push(attributeMapping);
      }
      
      if (this.fieldIntegrationService.IntegrationInfo.integrationType == IntegrationType.FastTrack) {
        let attributeMapping: IIntegrationMapping = {
          key: 'skill',
          integrateTo: 3,
          dataType: null,
          atsPropertyId: null,
          objectName: null,
          documentName: null,
          atsPropertyValue: null,
          addMonthsToExpiryDate: null,
        }
        let skillMappingIndex = newIntegrationMappings.findIndex(x => x.key == 'skill');
        if (skillMappingIndex !== -1) {
          newIntegrationMappings.splice(skillMappingIndex, 1);
        }
        newIntegrationMappings.push(attributeMapping);
      }
    }
    newAdditionalProps.integrationMappings = newIntegrationMappings;

    if (this.currentCheck.checkId == 8) // background check declaration
    {
      newAdditionalProps.integrationMappings = null;
    }

    result = { isSuccess: true, qry: { checkId: this.currentCheck.checkId, additionalProps: newAdditionalProps, orderNo: Math.max(...this._backgroundCheckService.checks.applicationformChecks.map(o => o.orderNo)) + 1 } };
    if (this.currentCheck.name == "BackgroundCheckDeclaration") {
      result.qry['orderNo'] = 0;
    }
    this.updateBackgroundCheckPropChanges.emit(result);
    this.bsCanvas.hide();
  }

  cancelChanges() {
    this.updateBackgroundCheckPropChanges.emit({ isNewAndCanceled: this.isAddBackgroundCheckSidebar, isSuccess: false, qry: null });
    this.bsCanvas.hide();
  }

}
