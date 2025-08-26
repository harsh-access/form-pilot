import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
// import { RxPopup, RxToast } from '@rx/view'; // Removed for simplified POC
import { FileService } from 'src/app/components/shared/services/file-services';
import { FieldTypeEnum } from 'src/app/Enums/FieldType.enum';
import { FormField } from 'src/app/view-modal/DynamicFormModel';
import { ApiResponseModel, fileUpload, lookupObj } from 'src/app/view-modal/GeneralApiModel';
import { DynamicFormService } from '../../dynamic-form.service';
import { IControlCategory, getControlCategoryList } from '../dynamic-common-data/control-category-function';
import { getEditPropertyList } from '../dynamic-common-data/edit-propertyList-function';
import { IFileUploadContainer, IPropList, ILkpOptionArr } from 'src/app/view-modal/GeneralModels';
import { ATSPropertyDatatypeEnum, IntegrationType, OnboardedObjects } from 'src/app/Enums/FieldIntegration.enum';
import { Columns, Sections, ATSMappingResponse } from 'src/app/view-modal/DynamicFormModel';
import { SaveChangesModel } from 'src/app/view-modal/EditFormModels';
import { OnboardedObjectTypes } from '../../Sidebars/fieldset-sidebar/fieldset-propertyList-functions';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { FieldsetService } from 'src/app/components/shared/services/fieldset.service';
import { crudChangeObj } from '../dynamic-common-data/crud-changes';
import { FormTypeEnum } from 'src/app/Enums/ApplicationForm.enum';
import { AtsLookupService } from '../../ats-lookup.service';
import { YesNoPopupComponent } from 'src/app/components/shared/custom-control/yes-no-popup/yes-no-popup.component';
declare var window: any;

@Component({
  selector: 'app-edit-field-properties',
  templateUrl: './edit-field-properties.component.html',
  styleUrls: ['./edit-field-properties.component.css'],
})
export class EditFieldPropertiesComponent implements OnInit {
  @Input() isAddField: boolean = false;
  @Input() formType: number;
  @Input() field!: Columns;
  @Input() isPayrollForm: boolean;
  @Input() isEditFormIntegration: boolean;
  @Input() formHasDynamicAgreement: boolean;
  @Input() contractThroughMergeTags: boolean;
  @Input() formProperty: { applicationFormId: number };
  @Input() clientId: number;
  @Input() section!: Sections;
  @Input() isSupportUser!: boolean;
  @Input() isInProjectClient: boolean;
  @Output() updatePropChanges = new EventEmitter<{ isNewAndCanceled?: boolean; isDependencyCRUD?: boolean; field?: Columns; changes: string[]; }>();
  @Output() updateFieldsetPropChanges = new EventEmitter<{ isSuccess: boolean, qry: object }>();
  bsCanvas: any;

  intialFormValue: object = {};
  currentCat: IControlCategory;
  filesContainer: Array<IFileUploadContainer> = [];
  propList: Array<IPropList> = [];
  isActiveTab: number = 0;
  isShowComponent: boolean = false;
  changesArr: string[] = [];
  isSaveEnabled: boolean = false;
  isDependentDataChanges: boolean = false;
  excludeAtsPropertyId: number[] = [];
  excludeAtsPropertyValue: string[] = [];
  multilineAtsArray: any = [];
  textObject: { [key: string]: any } = {};
  tabsToShow: string[] = ['Settings', 'Advance'];
  onboardedObjectsStrArr: string[];
  isCustomfieldIntegration: boolean;
  allColumns: Columns[] = [];
  isAtsLookups: boolean = false;
  protected isUserEditingMergeTags: boolean = false;

  private atsPropertyIdSubscription: Subscription;

  constructor(private fb: FormBuilder, private dynamicFormService: DynamicFormService, private fileService: FileService, private fieldsetService: FieldsetService, private _atsLookupService: AtsLookupService) {
    this.sanitizeFormValues()
    this.onboardedObjectsStrArr = Object.keys(OnboardedObjects).filter(key => !isNaN(Number(OnboardedObjects[key]))).map(key => String(OnboardedObjects[key]));
  }

  ngOnInit(): void {
    this.verifyFormChangeDetection();
    this.openCanvas();
    this.listenToIntegrationSkillChanges();
  }

  ngOnDestroy() {
    if (this.atsPropertyIdSubscription) {
      this.atsPropertyIdSubscription.unsubscribe();
    }
  }

  openCanvas() {
    this.bsCanvas = new window.bootstrap.Offcanvas(document.getElementById('editFieldProp'));
    this.setValuesToForm(this.field);
    if (this.propList.length > 0 && this.isShowComponent) this.bsCanvas.show();
  }

  public verifyFormChangeDetection() {
    if (this.isAddField) this.isSaveEnabled = true;
    else {
      this.EditForm.valueChanges.subscribe((val) => {
        Object.keys(this.intialFormValue).forEach((param) => {
          if (this.intialFormValue[param] != null) return;
          if (
            this.intialFormValue[param] == null &&
            this.EditForm.value[param] == ''
          )
            this.EditForm.patchValue({ [param]: null });
        });

        this.isSaveEnabled = Object.keys(this.intialFormValue).some((key) =>
          key != 'custTypeArr1'
            ? JSON.stringify(this.EditForm.value[key]) !=
            JSON.stringify(this.intialFormValue[key])
            : this.isLookupOptionChanged(key)
        );
      });
    }
  }

  downloadSkillData() {
  }

  setAtsIntegrationList(controlType: string) {
  }

  setupCommonValuesToForm(field: Columns) {
    // set all excat matched values
    this.EditForm.patchValue(field);
    // common for all
    this.EditForm.patchValue({
      questionSpan: field['questionSpan'] == null ? 0 : field['questionSpan']
    });

    const validControlTypes = [
      FieldTypeEnum.DocumentCollection,
      FieldTypeEnum.ClientReport,
      FieldTypeEnum.LableCheckBox,
      FieldTypeEnum.SingleFileUpload,
    ];


    if (validControlTypes.includes(FieldTypeEnum[field.controlType])) {
      this.EditForm.patchValue({
        integratedTo: field?.integratedTo ?? 1, // Use nullish coalescing for default value
      });
    }

    // Show Merge Tags if Merge Tags are Present
    if (this.EditForm?.get('mergeTagName')?.value != null) {
      this.EditForm.patchValue({
        custTypeShowMergeTags: true // if Merge Tag is available for a formfield the show it by default
      });
    }

    // Work For Skills Section && Single Choice Section for Merge Tags - simplified for POC

    //set value to custTypeForDynamicAgreementShow
    if (this.EditForm?.get('isSignatureRequired')?.value != null) {
      if (this.EditForm?.get('isSignatureRequired')?.value && this.EditForm?.get('isDynamicAgreement')?.value) {
        this.EditForm.patchValue({
          custTypeForDynamicAgreementShow: true
        });
      }
      else if (this.EditForm?.get('isSignatureRequired')?.value && !this.EditForm?.get('isDynamicAgreement')?.value && !this.formHasDynamicAgreement) {
        this.EditForm.patchValue({
          custTypeForDynamicAgreementShow: true
        });
      }
      else {
        this.EditForm.patchValue({
          custTypeForDynamicAgreementShow: false
        });
      }
    }
  }

  private setValuesToForm(field: Columns) {
    if (this.isEditFormIntegration && this.formType != 171) {
      this.tabsToShow.push('Integration');
    }


    try {
      //Clear all files
      this.filesContainer = [];


      // define and set propertyList
      this.currentCat = getControlCategoryList(0, this.field.controlType, 0)[0];

      // set PopertyList
      this.propList = getEditPropertyList(this.currentCat.catId);

      // Validations simplified for POC

      if (this.contractThroughMergeTags && this.currentCat.catId == 6) {
        this.propList.forEach((x) => {
          if (x.propType === 'fileUpload') {
            x.attr = x.attr || {};
            x.attr.isConvert = false;
            // x.attr.fileAccept = '.docx'; // remove so we can allow PDF Upload too
          }
        });

        // check if Signature is Required or Not
        this.allowedFileTypes_IAgreeButton(field.isSignatureRequired);
      }

      // If the form is not PayrollForm Don't Show option
      // to Integrate to Payroll Platform
      if (!this.isPayrollForm) {
        this.propList.forEach((x) => {
          if (x.prop == "integratedTo") {
            let idx = x?.attr?.listArr?.findIndex(x => x.id === 2)
            if (idx && idx != -1) {
              x.attr.listArr.splice(idx, 1);
            }
          }
        });
      }

      //set DropDown Value
      this.setDropDownValue(field);

      // set Dependency
      this.setDependency();

      // set all common values to form
      this.setupCommonValuesToForm(field);

      // set values as per their category
      this.setValuesByCategory();

      //Hide/Show prop into propList according to your field
      this.setVisbleProp();

      // set initial Form values
      this.intialFormValue = JSON.parse(JSON.stringify(this.EditForm.value));

      this.EditForm.get('controlType').valueChanges.subscribe(controlType => {

        switch (FieldTypeEnum[field.controlType]) {
          case FieldTypeEnum.DocumentCollection:
          case FieldTypeEnum.SingleFileUpload:
            this.setIntegrationList(OnboardedObjects.Documents, undefined, undefined, false);
            break;
          case FieldTypeEnum.TextBox:
          case FieldTypeEnum.DatePicker:
            if (controlType == "DatePicker" && !this.EditForm.value['fieldValidator']) {
              this.EditForm.patchValue({ fieldValidator: 'all' });
            }
            break;
          case FieldTypeEnum.Lable:
            break;
          default:
            this.setAtsIntegrationList(controlType)
            break;
        }

        // Perform additional actions as needed

      });

      this.EditForm.get('custTypeIsCustomfieldIntegration').valueChanges.subscribe(IsCustomfield => {
        this.isCustomfieldIntegration = IsCustomfield
        let iscustomfield = this.EditForm.get('custTypeIsCustomfieldIntegration').value

        this.manageCustomfieldIntegration1(IsCustomfield)
        // Perform additional actions as needed
      });

      this.EditForm.get('custTypeIsCorefieldIntegration').valueChanges.subscribe(IsChanged => {
        this.manageCorefieldIntegration(IsChanged)
      });

      //Perform value change event For Declaration section field
      this.EditForm.get('isSignatureRequired').valueChanges.subscribe(isSignatureRequired => {
        if (FieldTypeEnum[field.controlType] == FieldTypeEnum.LableCheckBox) {
          if (isSignatureRequired) {
            this.EditForm.patchValue({ isRequired: 1 });
            this.EditForm.patchValue({ placeholder: null });
            if (!this.formHasDynamicAgreement)
              this.EditForm.patchValue({ custTypeForDynamicAgreementShow: true });
            else
              this.EditForm.patchValue({ custTypeForDynamicAgreementShow: false });
          } else {
            this.EditForm.patchValue({ custTypeForDynamicAgreementShow: false });
            this.EditForm.patchValue({ isDynamicAgreement: false });
          }
        }

        // Listen to Signature Required control to allow PDF & Docs OR only Doc.
        if (this.currentCat.catId == 6) {
          this.allowedFileTypes_IAgreeButton(isSignatureRequired);
        }
      });

      this.EditForm.get('custTypeForAgreementDoc').valueChanges.subscribe(iscustTypeForAgreementDoc => {
        if (FieldTypeEnum[field.controlType] == FieldTypeEnum.LableCheckBox) {
          if (!iscustTypeForAgreementDoc) {
            this.EditForm.patchValue({ isSignatureRequired: false });
            this.EditForm.patchValue({ custTypeForDynamicAgreement: false });
          } else {
            this.EditForm.patchValue({ custTypeForDynamicAgreement: true });
          }
        }
      });

      this.EditForm.get('isDynamicAgreement').valueChanges.subscribe(isDynamicAgreement => {
        if (FieldTypeEnum[field.controlType] == FieldTypeEnum.LableCheckBox) {
          if (isDynamicAgreement) {
            this.EditForm.patchValue({ custTypeForDynamicAgreement: false });
          } else {
            this.EditForm.patchValue({ custTypeForDynamicAgreement: true });
          }
        }
      });


      this.isShowComponent = true;
    } catch (error) {
      console.log(error);
      this.isShowComponent = false;
    }
  }

  isNotesProperty(atsPropertyId: number): boolean {
    return false;
  }

  private manageCustomfieldIntegration1(IsCustomfield) {


  }

  private manageCorefieldIntegration(IsChanged) {
    let iscorefield = this.EditForm.get('custTypeIsCorefieldIntegration').value
    this.propList.forEach(prop => {
      if (prop?.propCategory != null && prop?.propCategory.split(',').includes(OnboardedObjects[OnboardedObjects.CoreFields])) {
        prop.propIsVisible = true;
      }
    });

    if (IsChanged && iscorefield) {

      let arrayList: Array<{ id: number; value: string }> = [];
      let indexToSkillUpdate = this.propList.findIndex(obj => obj.propLabel === "ATS / CRM Fields");
      if (indexToSkillUpdate !== -1) {
        this.propList[indexToSkillUpdate].attr.listArr = arrayList;

        this.field.objectName = String(OnboardedObjects.CoreFields);
        if (this.EditForm.get('objectName').value == String(OnboardedObjects.CoreFields)) {
          this.EditForm.patchValue({ atsPropertyValue: this.field.atsPropertyValue, atsPropertyId: this.field.atsPropertyId })
        }
        else {
          this.EditForm.patchValue({ atsPropertyValue: null, atsPropertyId: null })
        }
      }
    } else {
      this.field.objectName = String(OnboardedObjects.Candidate);
      this.setAtsIntegrationList(this.field.controlType)
      if (this.EditForm.get('objectName').value == String(OnboardedObjects.Candidate)) {
        this.EditForm.patchValue({ atsPropertyValue: this.field.atsPropertyValue, atsPropertyId: this.field.atsPropertyId })
      } else {
        this.EditForm.patchValue({ atsPropertyValue: null, atsPropertyId: null })
      }
    }
  }

  private manageCustomfieldIntegration() {
    if (this.isAddField) {
      this.EditForm.patchValue({
        custTypeIsCustomfieldIntegration: false
      });
    }
    else {
      if (this.field.objectName == String(OnboardedObjects.CustomFields)) {
        this.EditForm.patchValue({
          custTypeIsCustomfieldIntegration: true
        });
      } else {
        this.EditForm.patchValue({
          custTypeIsCustomfieldIntegration: false
        });
      }
      if (this.field.objectName == String(OnboardedObjects.CoreFields)) {
        this.EditForm.patchValue({
          custTypeIsCorefieldIntegration: true
        });
      } else {
        this.EditForm.patchValue({
          custTypeIsCorefieldIntegration: false
        });
      }

    }
  }

  //Fatching data And also Filter that Data from Local Storage
  private setIntegrationList(integrationType: OnboardedObjects, AllowedDatatype: string[] = [], propLabel?: string, IsApplyFilter: boolean = true) {

    const localStorageKey = `Client_${this.clientId}`;
    let integrationList: any;

    const fetchIntegrationList = () => {
      this.dynamicFormService.getAtsMappings([integrationType]).subscribe((response: ATSMappingResponse) => {
        const property = this.getPropertyByIntegrationType(integrationType);
        let customFieldList: Array<{ id: number, value: string, type?: string }> = [];

        if (response[property].length > 0) {
          if (integrationType === OnboardedObjects.CustomFields) {

            //Exclude CustomFieldList According Their ATSType And FieldType
            customFieldList = response.customFieldList.filter(atsItem => {
              const excludeAtsProperty = !this.excludeAtsPropertyValue.includes(atsItem.id.toString());
              const allowedDatatypeCheck = AllowedDatatype.length === 0 || AllowedDatatype.includes(atsItem.type);
              return excludeAtsProperty && allowedDatatypeCheck;
            });

            integrationList.customFieldList = response.customFieldList;
          }
          else if (integrationType === OnboardedObjects.Candidate) {
            const allowedDatatypeStrings = AllowedDatatype.map(String); // Convert AllowedDatatype to strings

            customFieldList = response.candidateList.filter(atsItem => {
              const excludeAtsProperty = !this.excludeAtsPropertyValue.includes(atsItem.id.toString());
              const allowedDatatypeCheck =
                allowedDatatypeStrings.length === 0 ||
                allowedDatatypeStrings.includes(atsItem.type); // Compare with string values
              return excludeAtsProperty && allowedDatatypeCheck;
            });

            integrationList[property] = response[property];
          }
          else {

            customFieldList = response[property].filter(atsItem => !this.excludeAtsPropertyValue.includes(atsItem.id.toString()));
            integrationList[property] = response[property];
          }

          localStorage.setItem(localStorageKey, JSON.stringify(integrationList));

          if (IsApplyFilter) {
            this.setValueIntoPropList(integrationType, "atsPropertyValue", customFieldList, propLabel);
          } else {
            this.setValueIntoPropList(integrationType, "atsPropertyValue", integrationList[property], propLabel);
          }
        }

      });
    };

    integrationList = JSON.parse(localStorage.getItem(localStorageKey)) || { candidateList: [], skillList: [], documentTypeOrFolder: [], ticketsAndLicences: [], customFieldList: [] };

    const property = this.getPropertyByIntegrationType(integrationType);

    if (integrationList[property].length > 0) {
      let customFieldList: Array<{ id: number, value: string, type?: string }> = [];

      if (integrationType === OnboardedObjects.CustomFields) {
        customFieldList = integrationList.customFieldList.filter(atsItem => {
          const excludeAtsProperty = !this.excludeAtsPropertyValue.includes(atsItem.id.toString());
          const allowedDatatypeCheck = AllowedDatatype.length === 0 || AllowedDatatype.includes(atsItem.type);
          return excludeAtsProperty && allowedDatatypeCheck;
        });
      }
      else if (integrationType === OnboardedObjects.Candidate) {
        const allowedDatatypeStrings = AllowedDatatype.map(String); // Convert AllowedDatatype to strings

        customFieldList = integrationList.candidateList.filter(atsItem => {
          const excludeAtsProperty = !this.excludeAtsPropertyValue.includes(atsItem.id.toString());
          const allowedDatatypeCheck =
            allowedDatatypeStrings.length === 0 ||
            allowedDatatypeStrings.includes(atsItem.type); // Compare with string values
          return excludeAtsProperty && allowedDatatypeCheck;
        });
      }
      else {
        customFieldList = integrationList[property].filter(atsItem => !this.excludeAtsPropertyValue.includes(atsItem.id.toString()));
      }

      // console.log(customFieldList, integrationList[property], this.excludeAtsPropertyValue);

      if (IsApplyFilter) {
        this.setValueIntoPropList(integrationType, "atsPropertyValue", customFieldList, propLabel);
      } else {
        this.setValueIntoPropList(integrationType, "atsPropertyValue", integrationList[property], propLabel);
      }

    } else {
      fetchIntegrationList();
    }
  }

  private listenToIntegrationSkillChanges() {
    this.EditForm.get('custTypeSkillCategory').valueChanges.subscribe((integrationType: any) => {
      if(this.currentCat.catId === 8){
      this.manageSkillsIntegrationListChange();
      }
    });
  }

  private manageSkillsIntegrationListChange() {
    let isFunctionalSkillIntegration = this.EditForm.get('custTypeSkillCategory').value;
    const localStorageKey = `Client_${this.clientId}`;
    let integrationList = JSON.parse(localStorage.getItem(localStorageKey)) || { candidateList: [], skillList: [], documentTypeOrFolder: [], ticketsAndLicences: [], customFieldList: [] };
    const propIndex = this.propList.findIndex(item => item.prop === 'atsPropertyValue' && item.propCategory === 'Skills');
    if (isFunctionalSkillIntegration) {
      this.propList[propIndex].attr.listArr = integrationList.skillList.filter(skill => skill?.category === 'functional' && !this?.excludeAtsPropertyValue?.includes(skill?.id?.toString()));
    } else {
      // By Default show Industry Skills
      this.propList[propIndex].attr.listArr = integrationList.skillList.filter(skill => skill?.category === 'industry' && !this?.excludeAtsPropertyValue?.includes(skill?.id?.toString()));
    }
  }

  //Adding Array into ATS Related DropDown
  private setValueIntoPropList(integrationType: OnboardedObjects, objectProp: string, arrayList: Array<{ id: number, value: string, type?: string }>, propLabel?: string) {
    this.propList.forEach(prop => {
      if (prop?.propCategory != null && prop?.propCategory.split(',').includes(OnboardedObjects[integrationType])) {
        prop.propIsVisible = true;
      }
    });


    let indexToSkillUpdate;

    if (propLabel) {
      indexToSkillUpdate = this.propList.findIndex(obj => obj.propLabel === propLabel);
    } else {
      indexToSkillUpdate = this.propList.findIndex(obj => obj.prop === objectProp && obj?.propCategory.split(',').includes(OnboardedObjects[integrationType]));
    }

    if (indexToSkillUpdate !== -1) {
      this.propList[indexToSkillUpdate].attr.listArr = arrayList;

    }


  }

  private getPropertyByIntegrationType(integrationType: OnboardedObjects): string {
    switch (integrationType) {
      case OnboardedObjects.Skills:
        return 'skillList';
      case OnboardedObjects.Documents:
        return 'documentTypeOrFolder';
      case OnboardedObjects.CustomFields: // Assuming CustomField is added to OnboardedObjects
        return 'customFieldList';
      case OnboardedObjects.Candidate: // Assuming CustomField is added to OnboardedObjects
        return 'candidateList';
      default:
        throw new Error(`Unsupported integration type: ${integrationType}`);
    }
  }

  private setDependency() {
    const idx = this.propList.findIndex((x) => x.prop == 'custTypeForDependency');
    const isAlreadyParantField = this.section.rows.flatMap(x => x.columns)
      .findIndex(t => t.dependentFormFieldColumns.length > 0 && t.dependentFormFieldColumns[0].refFormFieldId == this.field.formFieldId) != -1;

    if (this.isAddField || this.propList.length < 1 || idx == -1 || isAlreadyParantField) return;


    // prepare List
    this.allColumns = this.section.rows.flatMap((x) => x.columns);

    let columnList = this.allColumns.filter((c) => ['DropDown', 'RadioButton', 'SwitchCheckBox'].includes(c.controlType) && c.dependentFormFieldColumns.length <= 0)
      .sort((a, b) => a.tabIndex - b.tabIndex || a.columnIndex - b.columnIndex);

    let drpList: Columns[] = [];
    columnList.some((col) => {
      const flag = col.tabIndex >= this.field.tabIndex;
      if (!flag) drpList.push(col);
      return flag;
    });

    if (drpList.length < 1) return;
    // console.log('setDrpList', this.field.formFieldId, columnList, drpList);

    const isAlredyDependent = this.field.dependentFormFieldColumns.length > 0;

    if (isAlredyDependent && (
      this.field.dependentFormFieldColumns[0].action == "Hide" ||
      drpList.findIndex(t => t.formFieldId == this.field.dependentFormFieldColumns[0].refFormFieldId) == -1
    ))
      return;
    else if (isAlredyDependent) {
      this.EditForm.patchValue({
        custTypeForDependency: {
          formFieldId: this.field.formFieldId,
          refFormFieldId:
            this.field.dependentFormFieldColumns[0].refFormFieldId,
          refValue: (this.getControlType(this.field.dependentFormFieldColumns[0].refFormFieldId) == FieldTypeEnum.SwitchCheckBox) ? "45" : this.field.dependentFormFieldColumns[0].refValue,
          dependencyStatus: true,
        },
      });
    }
    else
      this.EditForm.patchValue({
        custTypeForDependency: {
          formFieldId: this.field.formFieldId,
          refFormFieldId: null,
          refValue: null,
          dependencyStatus: true,
        },
      });

    let dataObject = {
      refFormFieldId: drpList.sort((a, b) => b.tabIndex - a.tabIndex),
      refValue: isAlredyDependent
        ? drpList.find((x) => x.formFieldId == this.field.dependentFormFieldColumns[0].refFormFieldId).lookUps
        : [],
    };
    this.propList[idx]['attr'] = { dataObject };
  }

  private getControlType(refFormFieldId: number): FieldTypeEnum {
    return FieldTypeEnum[this.allColumns
      .find(column => column.formFieldId === refFormFieldId)
      .controlType];
  }

  private async setValuesByCategory(isFormToField: boolean = false) {
    switch (this.currentCat.catId) {
      case 1:
        this.manageCat1(isFormToField); // TextBox
        break;
      case 2:
        await this.manageCat2(isFormToField); // DropDown
        break;
      case 3:
        await this.manageCat3(isFormToField); // Radio
        break;
      case 4:
        await this.manageCat4(isFormToField); // MultiCheckBox
        break;
      case 5:
        this.manageCat5(isFormToField); // Label
        break;
      case 6:
        await this.manageCat6(isFormToField); // Declarations
        break;
      case 7:
        this.manageCat7(isFormToField); // File-Upload
        break;
      case 8:
        this.manageCat8(isFormToField); // Skills
        break;
      case 9:
        await this.manageCat9(isFormToField); // Client-PDF
        break;
      default:
        break;
    }
  }

  private setVisbleProp() {
    switch (this.currentCat.catId) {
      case 7:
        if (this.isAddField) {
          let indexTocontrolType = this.propList.findIndex(obj => obj.prop === "controlType");
          if (indexTocontrolType !== -1) {
            this.propList[indexTocontrolType].propIsVisible = true;
          }
        }
        break;
      case 8:
        if (this.isAddField) {
          let indexToSkillUpdate = this.propList.findIndex(obj => obj.prop === "custTypeBulkSkillDoc");
          if (indexToSkillUpdate !== -1) {
            this.propList[indexToSkillUpdate].propIsVisible = true;
          }
        }
        break;
      default:
        break;
    }

    if (this.isSupportUser) {
      //Hide/Show
      this.isEnableColumnIdex_MaxColumn();
      // Merge Tag Flow should only work for Support User remove this Condition if you want it to work everywhere same
      this.isEnableMergeStackFlow_MultiLine();
    }
  }




  isEnableColumnIdex_MaxColumn() {
    let columnIndexControlType = this.propList.findIndex(obj => obj.prop === "columnIndex");
    let maxColumnControlType = this.propList.findIndex(obj => obj.prop === "maxColumn");

    if (this.isSupportUser) {
      if (columnIndexControlType !== -1) {
        this.propList[columnIndexControlType].propIsVisible = true;
      }
      if (maxColumnControlType !== -1) {
        this.propList[maxColumnControlType].propIsVisible = true;
      }
    }

    if (!this.isAddField) {
      // prepare List
      //Below Logic are written for Hidding columnIndex control for the First Field of the section
      var FirstDataField: Columns | Error = this.section.rows.flatMap((x) => x.columns).sort((a, b) => a.tabIndex - b.tabIndex).firstOrDefault();
      if (FirstDataField['formFieldId'] == this.field.formFieldId) {
        if (columnIndexControlType !== -1) {
          this.propList[columnIndexControlType].propIsVisible = false;
        }
      }
    }

  }

  private isEnableMergeStackFlow_MultiLine() {
    const newMeregTagTextBox = this.propList.findIndex(obj => obj.prop === "mergeTagName");

    // if (false) { // Hiding Merge Tag Flow for all Contorls except Support User
    if (this.isSupportUser) {
      if (newMeregTagTextBox !== -1) {
        this.propList[newMeregTagTextBox].propIsVisible = true;
        // if MergeTagName is not null then Visible Lookups MergeTags
        const data = this?.EditForm?.get('mergeTagName')?.value;
        if (data != null && !this.isYesNoLookup()) {
          this.showMeregeTagFields(data);
        }
      }

      // Show Merge Tag Switches when Support User is Enable ,if Mereg Tags are null then
      const MergeTagSwitch = this.propList.findIndex(obj => obj.prop === "custTypeShowMergeTags");
      if (MergeTagSwitch !== -1) {
        this.propList[MergeTagSwitch].propIsVisible = true;
      }
    }
  }

  private setLookupOptions() {
    this.propList.forEach((x) => {
      if (x.propType == 'optionBox') {
        this.EditForm.get(x.prop).reset();
        if (this.field.lookUps || this.field.lookupViewId) {
          this.field.lookUps.forEach((lkp) =>
            this.addNewOption(x.prop, {
              id: lkp.id,
              value: lkp.value,
              clientLookupCode: lkp.clientLookupCode
                ? lkp.clientLookupCode
                : null,
              mergeTagName: lkp.mergeTagName
                ? lkp.mergeTagName
                : null,
            })
          );
        } else[1, 2, 3].forEach((y) => this.addNewOption(x.prop));
      }
    });
  }

  // TextBox
  private manageCat1(isFormToField: boolean = false) {
    if (!isFormToField) {
      // radioBtnPair custType1
      this.EditForm.patchValue({ custType1: (this.field['controlType'] == 'MultilineTextbox') ? 'MultilineTextbox' : 'TextBox' });
    }
    else {
      if (this.EditForm.value['custType1'] == 'MultilineTextbox') {
        this.EditForm.value['controlType'] = 'MultilineTextbox';
      } else {
        if (this.EditForm.value['controlType'] == 'MultilineTextbox')
          this.EditForm.value['controlType'] = 'TextBox';
      }
      if (this.EditForm.value['controlType'] == 'DatePicker')
        this.EditForm.value['maxLength'] = null;
    }
  }

  // DropDown
  private async manageCat2(isFormToField: boolean = false) {
    if (!isFormToField) {
      this.setLookupOptions();
    } else {
      await this.setupLookupChange();
    }
  }

  // Radio
  private async manageCat3(isFormToField: boolean = false) {
    if (!isFormToField) {
      this.setLookupOptions();
    } else {
      await this.setupLookupChange();
    }
  }

  // MultiCheckBox
  private async manageCat4(isFormToField: boolean = false) {
    if (!isFormToField) {
      this.setLookupOptions();
    } else {
      await this.setupLookupChange();
    }
  }

  // Label
  private manageCat5(isFormToField: boolean = false) {
    if (!isFormToField) {
      // code for fill values from Field to form
      this.EditForm.patchValue({ controlType: this.field['controlType'] == 'SpecialLable' });

      if (this.EditForm.value['placeholder']) {
        let info = this.EditForm.value['placeholder'].toString().trim();
        this.EditForm.patchValue({ placeholder: info });
      }

    } else {

      if ((this.EditForm.value['controlType'] != true) && this.validateURL(this.EditForm.value['additionalInfo']) && (this.EditForm.value['placeholder'] && this.EditForm.value['placeholder'].trim())) {
        this.EditForm.patchValue({ controlType: 'LinkLable' });
      } else {
        // code for fill values from Form to Field
        this.EditForm.value['controlType'] == true ? this.EditForm.patchValue({ controlType: 'SpecialLable' }) : this.EditForm.patchValue({ controlType: 'Lable' });
      }

    }

  }

  validateURL(url: string): boolean {
    try {
      new URL(url); // This will throw an error if the string is not a valid URL.
      return true;
    } catch (_) {
      return false;
    }
  }

  // Declarations
  private async manageCat6(isFormToField: boolean = false) {
    if (!isFormToField) {

      this.EditForm.patchValue({ custTypeForAgreementDoc: false });

      if (this.EditForm.value['labelName']) {
        let lblValue = this.EditForm.value['labelName'].toString().trim();
        this.EditForm.patchValue({ labelName: lblValue });
      }

      if (this.EditForm.value['placeholder']) {
        let info = this.EditForm.value['placeholder'].toString().trim();
        this.EditForm.patchValue({ placeholder: info });
      }

      if (this.EditForm.value['isSignatureRequired'] || (this.EditForm.value['defaultValue'] != null && this.EditForm?.value?.defaultValue?.trim() != "")) {
        this.EditForm.patchValue({ custTypeForAgreementDoc: true });
      }

      if (this.EditForm.value['custTypeForAgreementDoc'] && !this.EditForm.value['isDynamicAgreement']) {
        this.EditForm.patchValue({ custTypeForDynamicAgreement: true });
      }

    } else {

      if (this.EditForm.value['placeholder']) {
        this.EditForm.value['placeholder'] = ' ' + this.EditForm.value['placeholder']?.toString()?.trim();
      }

      if (this.filesContainer.length > 0) {
        await this.uploadfiles(); // set values to this.EditForm.value['defaultValue'];
        this.EditForm.value['additionalInfo'] = this.EditForm.value['defaultValue'];
      } else if (this.EditForm.value['custTypeForAgreementDoc']) {
        this.EditForm.value['additionalInfo'] = this.EditForm.value['defaultValue'];
      } else if (!this.EditForm.value['custTypeForAgreementDoc']) {
        this.EditForm.value['defaultValue'] = this.EditForm.value['additionalInfo'];
      }

      if (this.EditForm.value['custTypeForAgreementDoc'] && this.EditForm.value['isDynamicAgreement']) {
        this.EditForm.value['defaultValue'] = null;
        this.EditForm.value['additionalInfo'] = null;
      }
    }
  }

  // File-Upload
  private manageCat7(isFormToField: boolean = false) {

    // if (this.isAddField && !isFormToField) {
    //   this.EditForm.patchValue({
    //     integratedTo:3
    //   });
    // }

    if (!isFormToField) {
      // switch controlType
      this.EditForm.patchValue({
        controlType: this.field['controlType'] == 'DocumentCollection'
      });

      if (this.EditForm.value && this.EditForm.value.placeholder !== null && this.EditForm.value.placeholder !== undefined && this.EditForm.value.placeholder != "") {
        // Check if placeholder does not already contain "{{CandidateName}}-"
        if (this.EditForm.value.placeholder?.includes('{{CandidateName}}-')) {
          // If it does not contain, append "{{CandidateName}}-" to the beginning
          this.EditForm.value.placeholder = this.EditForm.value.placeholder.replace('{{CandidateName}}-', '');
          this.EditForm.patchValue({
            placeholder: this.EditForm.value.placeholder.replace('{{CandidateName}}-', ''),
            custTypeIsAppendName: true,
          });
        }
        else {
          this.EditForm.patchValue({ custTypeIsAppendName: false });
        }
      }
    }
    else {

      this.EditForm.value.placeholder = (this.EditForm.value.placeholder == null || this.EditForm.value.placeholder == "") ? null : this.EditForm.value.placeholder;

      if (!this.EditForm.value['controlType']) {
        if (!this.EditForm.value['placeholder']) {
          this.EditForm.value['placeholder'] = this.EditForm.value['labelName'];
        }

        if (this.EditForm.value.custTypeIsAppendName) {
          // Check if placeholder does not already contain "{{CandidateName}}-"
          if (this.EditForm.value.placeholder != null && !this.EditForm.value.placeholder.includes("{{CandidateName}}-")) {
            // If it does not contain, append "{{CandidateName}}-" to the beginning
            this.field.placeholder = "{{CandidateName}}-" + this.EditForm.value.placeholder;
            this.EditForm.value.placeholder = "{{CandidateName}}-" + this.EditForm.value.placeholder;
          }
        } else {
          // Check if placeholder contains "{{CandidateName}}-"
          if (this.EditForm.value.placeholder != null && this.EditForm.value.placeholder.includes("{{CandidateName}}-")) {
            // If it contains, remove "{{CandidateName}}-" from the placeholder
            this.EditForm.value.placeholder = this.EditForm.value.placeholder.replace("{{CandidateName}}-", '');
            this.field.placeholder = this.EditForm.value.placeholder.replace("{{CandidateName}}-", '');
          }
        }
      } else {
        if (this.EditForm.value.custTypeIsAppendName) {
          this.field.placeholder = "{{CandidateName}}-";
          this.EditForm.value.placeholder = "{{CandidateName}}-";
        }
        else {
          this.field.placeholder = null;
        }
      }

      this.EditForm.value['controlType'] = this.EditForm.value['controlType'] == true ? 'DocumentCollection' : 'SingleFileUpload';
    }

    // Allow Only One DocumentUpload Collection Per Sub-Section
    const allColumns = this.section.rows.flatMap(row => row.columns);
    const collectionControls = allColumns.filter(x => x.controlType == "DocumentCollection");
    if (collectionControls.length > 0 && this.isAddField) {
      const index = this.propList.findIndex(x => x.prop == 'controlType');
      if (index !== -1) {
        this.EditForm.patchValue({ controlType: false });
        this.propList.splice(index, 1); // Removes the element at 'index'
      }
    }
  }

  // Skills
  private manageCat8(isFormToField: boolean = false) {
    this.tabsToShow = ['Settings', 'Advance'];

    if (this.isAddField && !isFormToField) {
      this.EditForm.patchValue({ questionSpan: 6, answerSpan: 4 });
    }
  }


  // ClientPDF
  private async manageCat9(isFormToField: boolean = false) {
    if (!isFormToField) {
      if (
        this.EditForm.value['labelName'] != null &&
        this.EditForm.value['labelName'] != ''
      ) {
        let lblValue = this.EditForm.value['labelName'].toString().trim();
        this.EditForm.patchValue({ labelName: lblValue });
      }
    } else {
      this.field.fieldClass = null;
      await this.uploadfiles();
    }
  }

  /** Reactive forms **/
  EditForm: FormGroup = this.fb.group({
    formFieldId: [],
    tabIndex: [],
    columnIndex: [],
    labelName: [],
    placeholder: [],
    maxLength: [],
    maxColumn: [],
    additionalInfo: [],
    defaultValue: [],
    isRequired: [],
    isComment: [],
    controlType: [],
    isSignatureRequired: [],
    isDynamicAgreement: [false],
    custTypeForDynamicAgreement: [],
    custTypeForDynamicAgreementShow: [],
    questionSpan: [],
    answerSpan: [],
    lookupViewId: [],
    custType1: [],
    custTypeForDependency: [], // it is only used for the dependency
    atsPropertyId: [],
    atsPropertyValue: [],
    integratedTo: [],
    custTypeArr1: this.fb.array([]),
    custTypeIsAppendName: [],
    custTypeIsCustomfieldIntegration: [],
    custTypeSkillCategory: [false],
    custTypeIsCorefieldIntegration: [],
    objectName: [],
    custTypeAtsPropertyValue: [],
    coreTypeatsPropertyValue: [],
    custTypeCandidateAtsPropertyValue: [],
    custTypeForAgreementDoc: [],
    custTypeBulkSkillDoc: [],
    fieldValidator: [],
    mergeTagName: [null],
    custTypeselectedButtonForMergeTag: ['_R'],
    custTypeShowMergeTags: [false],
    custTypeShowMergeTagOptions: [false],
    custTypeselectedButtonForYesNoLookups: ['_R'],
    custTypeInputForYesLookups: [null],
    custTypeInputForNoLookups: [null]
  });

  sanitizeValue(value: any): any {
    return (value === null || value === "") ? null : value;
  }

  sanitizeFormValues() {
    const controls = this.EditForm.controls;
    const controlList: string[] = ["atsPropertyValue"];

    controlList.forEach(controlName => {
      const control = controls[controlName];

      control.valueChanges.subscribe(value => {
        control.setValue(this.sanitizeValue(value), { emitEvent: false });
      });
    });
  }

  /** Template Methods **/

  dependentSelectionPairValueChange(selectedValue: string, prop: string, arrayKey: string, nextDependentListKey: string = null) {
    if (selectedValue == null || selectedValue == 'null' || selectedValue == '') {
      let valueObj = this.EditForm.value['custTypeForDependency'];
      valueObj['refFormFieldId'] = valueObj['refValue'] = null;

      // console.log('while null', valueObj);

      this.EditForm.patchValue({ custTypeForDependency: valueObj });

      this.propList.find((x) => x.prop == prop).attr.dataObject[nextDependentListKey] = [];
      return;
    }

    let data: any = this.propList.find((x) => x.prop == prop);
    let dataList: any[] = data.attr.dataObject[arrayKey];
    if (!dataList) return;
    if (nextDependentListKey) {
      data.attr.dataObject[nextDependentListKey] = dataList.find(
        (x) => x.formFieldId.toString() == selectedValue
      ).lookUps;
    }

    let obj = this.EditForm.value['custTypeForDependency'];

    if (arrayKey == 'refValue' && (this.getControlType(obj['refFormFieldId']) == FieldTypeEnum.SwitchCheckBox)) {
      selectedValue == "45" ? "true" : selectedValue;
    }

    obj[arrayKey] = selectedValue ? selectedValue : null;
    if (arrayKey == 'refFormFieldId') {
      obj[arrayKey] = selectedValue ? Number(selectedValue) : null;
      obj[nextDependentListKey] = null;
    }

    // console.log('while value', obj);
    this.EditForm.patchValue({ custTypeForDependency: obj });
  }

  setDepencyStatus(prop: string, propValue: any) {
    propValue['dependencyStatus'] = !propValue['dependencyStatus'];
    if (!propValue['dependencyStatus']) {
      propValue['refFormFieldId'] = this.field.dependentFormFieldColumns[0].refFormFieldId;
      propValue['refValue'] = this.field.dependentFormFieldColumns[0].refValue;

      let obj = this.propList.find(x => x.prop == prop).attr.dataObject;
      obj['refValue'] = obj['refFormFieldId'].find((y: Columns) => y.formFieldId == this.field.dependentFormFieldColumns[0].refFormFieldId).lookUps;
    }
    this.EditForm.patchValue({ [prop]: propValue });
  }

  // show-hide on dependent
  getDependent(prop: string): boolean {
    let dependency = this.propList.find((x) => x.prop == prop && (x?.propIsVisible ?? true)).attr.dependentOn;

    const isMergeTagsWithOptions = [2, 3, 4]
    if (prop == 'custTypeArr1' && isMergeTagsWithOptions.includes(this.currentCat.catId) && this.isActiveTab == 1) { // Custom Logic for Merge Tags
      const mergeTagFields = this.propList.filter((x) => x.prop == prop && x.propType == 'mergeTagbox')[0];
      dependency = mergeTagFields.attr.dependentOn;
    }

    return dependency?.refValue?.includes(this.EditForm.value[dependency.id]);
  }

  // File Upload
  isFileUploaded(prop: string, isFileData: boolean = false): boolean {
    let url = this.EditForm.value[prop];
    return url && url != null && url != ''
      ? true
      : this.filesContainer.findIndex((x) => x.prop == prop) > -1;
  }

  removeFileUrl(prop: string) {
    let idx = this.filesContainer.findIndex((x) => x.prop == prop);
    if (idx > -1) this.filesContainer.splice(idx, 1);
    this.EditForm.controls[prop].setValue(null);
  }

  getFileName(prop: string): string {
    let url: string = this.EditForm.value[prop];
    if (url && url != null && url != '')
      return prepareFileName(url.split('/').slice(-1)[0]);

    let idx = this.filesContainer.findIndex((x) => x.prop == prop);
    return idx > -1
      ? prepareFileName(this.filesContainer[idx].fileData.fileName)
      : 'No Name';
  }

  onFileChange(data: any, item: IPropList) {
    let apiFileData: fileUpload = { fileName: null, base64Data: null, formFieldId: 0, isConvert: item?.attr?.isConvert !== undefined ? item.attr.isConvert : true };
    var file = null;
    try {
      file = data.srcElement.files[0];
    } catch (e) {
      file = data.target.files[0];
    }
    if (file) {
      apiFileData['fileName'] = file.name;
      if (file.size >= (5000 * 1024))  //5000 Kb
      {
        console.error("File size is larger than 5000 kb. It is not allowed");
        this.EditForm.value[item.prop] = this.field[item.prop];
        return;
      }

      let ext = file.name.split('.').pop().toLowerCase();

      var extensionsArray = [".pdf", ".doc", ".docx", ".xlsx"];
      if (item?.attr?.fileAccept != null) {
        extensionsArray = item.attr.fileAccept.split(',');
        extensionsArray = extensionsArray.map(ext => ext.replace('.', ''));
      }
      if (extensionsArray.indexOf(ext) == -1) {
        console.error("File type not supported");
        this.EditForm.value[item.prop] = this.field[item.prop];
        return;
      }

      var fileBase64 = "";
      var reader = new FileReader();

      reader.readAsBinaryString(file);
      reader.onload = (readerEvt: any) => {
        fileBase64 = !readerEvt ? btoa(reader['content']) : btoa(readerEvt.target.result);
        if (fileBase64 != null && fileBase64 != '' && apiFileData.fileName != null && apiFileData.fileName != '') {
          apiFileData['base64Data'] = fileBase64;
          if (!this.isAddField) apiFileData['formFieldId'] = this.field.formFieldId;
          this.filesContainer.push({ prop: item.prop, fileData: apiFileData });
          console.log(this.filesContainer)
        }
      }
    }
  }

  setDropDownValue(field: Columns) {

    if (this.isAddField) {
      this.fallBackIntegration(field);

    } else {

      if ([1, 2, 3, 4, 6].includes(this.currentCat.catId)) {
        this.manageCustomfieldIntegration()
      }

      switch (field.objectName) {
        case OnboardedObjects.Candidate.toString():
        case OnboardedObjects.CustomFields.toString():
        case OnboardedObjects.CoreFields.toString():
          this.setAtsIntegrationList(field.controlType)
          break;
        case OnboardedObjects.Skills.toString():
        case 'skill':
          this.setIntegrationList(OnboardedObjects.Skills);
          break;
        case OnboardedObjects.Documents.toString():
          this.setIntegrationList(OnboardedObjects.Documents, undefined, undefined, false);
          break;
        default:
          this.fallBackIntegration(field);
          break;
      }
    }

  }

  fallBackIntegration(field: Columns) {
    if ([1, 2, 3, 4, 6].includes(this.currentCat.catId)) {
      this.setAtsIntegrationList(field.controlType)
      this.manageCustomfieldIntegration()
    }

    if (this.currentCat.catId == 8) {
      this.setIntegrationList(OnboardedObjects.Skills);
    }

    if (this.currentCat.catId == 7) {
      this.setIntegrationList(OnboardedObjects.Documents, undefined, undefined, false);
    }

  }

  downloadFile(prop: string) {
    const url: string = this.EditForm.value[prop];
    if (url && url != null && url != '') {
      this.dynamicFormService.postDownloadUploadedFile({ FileUrl: url }).subscribe((res: ApiResponseModel) => {
        if (res && res.isSuccess == true) {
          this.fileService.downloadFileFromUrl(res.message);
        } else {
          console.error('File Not available');
        }
      });
    } else if (this.filesContainer.findIndex(x => x.prop == prop) > -1) {
      console.log('Save the changes first before you can download');
    }
    else {
      console.error('File Not available');
    }
  }

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  // formArray for Lookup-Options
  addNewOption(prop: string, obj: ILkpOptionArr = { id: null, value: null, clientLookupCode: null, mergeTagName: null }) {
    let arr = <FormArray>this.EditForm.get(prop)
    let frm = this.fb.group({
      id: [(obj.id != null ? obj.id : null)],
      value: [obj.id != null ? obj.value : `Option ${arr.length + 1}`, [Validators.required]],
      clientLookupCode: [obj.clientLookupCode],
      mergeTagName: [this.removeMergeTagSuffix(obj.mergeTagName), this.isSupportUser ? [Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)] : []]
    });
    arr.push(frm);

    // Merge Tag Flow should only work for Support User remove this Condition if you want it to work everywhere same
    if (this.isSupportUser) {
      const PrimaryTag = this.EditForm?.get('mergeTagName')?.value;
      if (PrimaryTag != null) {
        this.EditForm.patchValue({
          custTypeselectedButtonForMergeTag: this.getMergeTagSuffix(obj.mergeTagName),
          custTypeShowMergeTags: true // if Merge Tag is available for a formfield the show it by default
        });
      }

      // Check if Merge Tags for Options are created or not, if they are created then show it by default only if Primary Merge Tags are not null
      const OptionTag = frm?.value?.mergeTagName;
      if (OptionTag != null && PrimaryTag != null) {
        this.EditForm.patchValue({
          custTypeShowMergeTagOptions: true // if Merge Tag is available for a Options the show it by default
        });
      }

      if (this.currentCat.catId == 3) {
        this.enableMergeTagForSingleChoice();
        this.singleChoiceYesNoMergeTag(); // Update Merge Tags Only For Yes & No Values, so the user can replace radio & checkbox in docs by getting Pre-Populated Tags from UI
        this.updateMergeTagVisibilityBasedOnArray(); // Toggle visibility of Yes&No Lookups Merge Tags Only
      }
    }
  }

  /** Other Methods */
  private async setValuesToField(form: any) {

    // here manage for all
    this.setupCommonValuesToField();

    // here mange specific category
    await this.setValuesByCategory(true);

    // set static values based on control type
    this.staticSetupByControlType();


    let arr = this.propList.filter(x => !x.prop.startsWith('custType')).map(s => s.prop);
    this.changesArr = [...new Set(this.changesArr.concat(arr))];
    this.changesArr.forEach((prop) => {
      this.field[prop] = this.EditForm.value[prop];
    });

    // set after
    if (this.changesArr.includes('isRequired') && this.EditForm.value['isRequired'] == true) {
      this.changesArr.push('isPostLiveManage');
      this.field['isPostLiveManage'] = true;
    }
  }


  validateDependency() {
    const initialDependencyData = JSON.parse(
      JSON.stringify(this.intialFormValue['custTypeForDependency'])
    );
    const formDepenedcyData = JSON.parse(
      JSON.stringify(this.EditForm.value['custTypeForDependency'])
    );

    switch (true) {
      case this.intialFormValue['custTypeForDependency'] == null:
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

  setupCommonValuesToField() {
    for (const key in this.EditForm.value) {
      switch (key) {
        case 'questionSpan':
          if (this.EditForm.controls['questionSpan']?.dirty) {
            if (this.EditForm.value['questionSpan'] > 0)
              this.EditForm.value['answerSpan'] = this.EditForm.value['questionSpan'] != 12 ? 12 - this.EditForm.value['questionSpan'] : null;
            else
              this.EditForm.patchValue({ questionSpan: null, answerSpan: 12 });

            this.changesArr.push('answerSpan');
          }
          break;
        case 'lookupViewId':
          if (
            this.EditForm.value['lookupViewId'] == null ||
            this.EditForm.value['lookupViewId'] == '' ||
            this.EditForm.value['lookupViewId'] < 1
          )
            this.EditForm.value['lookupViewId'] = this.field['lookupViewId']
              ? this.field['lookupViewId']
              : null;
          break;
        default:
          break;
      }
    }
  }


  private staticSetupByControlType() {
    switch (this.EditForm.value['controlType']) {
      case 'DocumentCollection':
        if (this.isAddField) {
          this.EditForm.value.maxColumn = 1;
          this.EditForm.value.columnIndex = 1;
          this.EditForm.value.questionSpan = 12;
          this.EditForm.value.answerSpan = null;
          this.EditForm.value.fieldName = 'UploadDocumentCollection';
          this.changesArr.push('maxColumn', 'fieldName', 'placeholder');
        }
        this.EditForm.value.labelName = "";
        this.EditForm.value.isRequired = false;
        break;

      case 'SwitchCheckBox':
        if (this.isAddField) {
          this.EditForm.value.lookupViewId = 1;
          this.changesArr.push('objectName', 'answerSpan', 'lookupViewId');
        }
        break;
        
      case 'SingleFileUpload':
        if (!this.isSupportUser) {
          this.EditForm.value.maxColumn = this.section.maxColumn;
        }
        this.changesArr.push('maxColumn');
        break;

      default:
        if (this.isAddField) {
          this.manage_Cand_Cus_FieldFlow();
        }
        else {
          if (this.field.objectName == String(OnboardedObjects.Candidate) || this.field.objectName == String(OnboardedObjects.CustomFields) || this.field.objectName == String(OnboardedObjects.CoreFields)) {
            this.manage_Cand_Cus_FieldFlow();
          }
        }
        break;
    }
  }

  private manage_Cand_Cus_FieldFlow() {
    if (false) { // ATS integration disabled for simplified POC
      if (this.EditForm.value.custTypeIsCustomfieldIntegration) {
        this.field.objectName = String(OnboardedObjects.CustomFields);
        this.EditForm.value.objectName = String(OnboardedObjects.CustomFields);
        this.changesArr.push('atsPropertyId');
      }
      else if (this.EditForm.value.custTypeIsCorefieldIntegration) {
        this.field.objectName = String(OnboardedObjects.CoreFields);
        this.EditForm.value.objectName = String(OnboardedObjects.CoreFields);
        this.field.atsPropertyId = (this.EditForm.value.atsPropertyId != null && this.EditForm.value.atsPropertyId !== "") ? this.EditForm.value.atsPropertyId : null;
        this.EditForm.value.atsPropertyId = this.field.atsPropertyId
        this.EditForm.value.atsPropertyValue = this.field.atsPropertyValue
      }
      else {
        this.EditForm.value.atsPropertyValue = this.EditForm.value.objectName == String(OnboardedObjects.CustomFields) ? null : this.EditForm.value.atsPropertyValue;
        this.field.objectName = String(OnboardedObjects.Candidate);
        this.EditForm.value.objectName = String(OnboardedObjects.Candidate);
        this.EditForm.value.atsPropertyId = (this.EditForm.value.atsPropertyId != null && this.EditForm.value.atsPropertyId !== "") ? this.EditForm.value.atsPropertyId : null;

        if (false) {
          if (this.isNotesProperty(this.field.atsPropertyId) || this.isNotesProperty(this.EditForm.value.atsPropertyId)) {
            this.field.atsPropertyValue = this.EditForm.value['custTypeAtsPropertyValue'];
            this.field.objectName = String(OnboardedObjects.Candidate);
            // this.EditForm.patchValue({ atsPropertyValue: this.field.atsPropertyValue, objectName: String(OnboardedObjects.Candidate) })
            this.EditForm.value['atsPropertyValue'] = this.field.atsPropertyValue;
            this.EditForm.value['objectName'] = String(OnboardedObjects.Candidate);
          }
        }

        if (false) {
          this.field.atsPropertyValue = this.EditForm.value['custTypeCandidateAtsPropertyValue'];
          this.field.objectName = String(OnboardedObjects.Candidate);
          // this.EditForm.patchValue({ atsPropertyValue: this.field.atsPropertyValue, objectName: String(OnboardedObjects.Candidate) })
          this.EditForm.value['atsPropertyValue'] = this.field.atsPropertyValue;
          this.EditForm.value['objectName'] = String(OnboardedObjects.Candidate);
        }
      }

      this.changesArr.push('objectName');
    }
  }

  private isYesNoLookup(): boolean {
    let optionArr: Array<ILkpOptionArr> = this.EditForm.value['custTypeArr1'];
    if (
      optionArr.count() == 2 &&
      optionArr[0].value.toLowerCase()?.trim() == 'yes' &&
      optionArr[1].value.toLowerCase()?.trim() == 'no'
    )
      return true;
    return false;
  }

  // private isLookupOptionChanged(key: string = 'custTypeArr1'): boolean {
  //   // console.log(`${JSON.stringify(this.intialFormValue[key].map(t=>t.value))}\n${JSON.stringify(this.EditForm.value[key].map(t=>t.value))}`);
  //   return (
  //     JSON.stringify(this.EditForm.value[key].map((t) => t.value?.trim())) !=
  //     JSON.stringify(this.intialFormValue[key].map((t) => t.value?.trim()))
  //   );
  // }

  //  Updated Function for Merge Tag Changes
  private isLookupOptionChanged(key: string = 'custTypeArr1'): boolean {
    const currentValues = JSON.stringify(this.EditForm.value[key].map(t => t.value?.trim()));
    const initialValues = JSON.stringify(this.intialFormValue[key].map(t => t.value?.trim()));

    if (this.EditForm.get('mergeTagName')?.value == null) {
      return currentValues !== initialValues;
    } else {
      const mergeTagChanges = JSON.stringify(this.EditForm.value[key].map(t => t.mergeTagName?.trim()));
      const initialMergeTagValues = JSON.stringify(this.intialFormValue[key].map(t => t.mergeTagName?.trim()));

      return !(currentValues === initialValues && mergeTagChanges === initialMergeTagValues);
    }
  }

  // Create new checker function for checking LookupMappings
  private isAtsLookupOptionChanged(key: string = 'custTypeArr1'): boolean {
    const currentLableValues = JSON.stringify(this.EditForm.value[key].map(t => t.value?.trim()));
    const initialLableValues = JSON.stringify(this.intialFormValue[key].map(t => t.value?.trim()));
    if (currentLableValues != initialLableValues) return true;

    if (this.EditForm.get('mergeTagName')?.value != null) {
      const currentMergeTagValues = JSON.stringify(this.EditForm.value[key].map(t => t.mergeTagName?.trim()));
      const initialMergeTagValues = JSON.stringify(this.intialFormValue[key].map(t => t.mergeTagName?.trim()));
      if (currentMergeTagValues != initialMergeTagValues) return true;
    }

    const currentIdValues = JSON.stringify(this.EditForm.value[key].map(t => t.id));
    const initialIdValues = JSON.stringify(this.intialFormValue[key].map(t => t.id));
    if (currentIdValues != initialIdValues) return true;

    const currentLookupCodeValues = JSON.stringify(this.EditForm.value[key].map(t => t.clientLookupCode));
    const initialLookupCodeValues = JSON.stringify(this.intialFormValue[key].map(t => t.clientLookupCode));
    if (currentLookupCodeValues != initialLookupCodeValues) return true;

    return false;
  }


  /** Make Api calls and general-setup after response */
  private async setupLookupChange() {
    if (this.isAtsLookups) {
      await this.setupAtsLookupChange();
      return;
    }

    // verify for option changes
    if (!this.isAddField && !this.isLookupOptionChanged()) {
      return;
    }

    // check for static-lookups
    if (this.isYesNoLookup()) {
      this.EditForm.value['lookupViewId'] = 1;
      this.changesArr.push('lookupViewId');
      return;
    }

    // New or Update lookup-value
    if (
      this.isAddField &&
      this.field.lookupViewId == 1 &&
      !this.isYesNoLookup()
    ) {
      let arr = this.EditForm.value['custTypeArr1'];
      arr.forEach((ele) => {
        ele.id = null;
      });
    }

    let obj: lookupObj = {
      applicationFormId: this.formProperty.applicationFormId,
      lookups: this.EditForm.value['custTypeArr1'],
    };
    if (!this.isAddField) {
      obj['formFieldId'] = this.field.formFieldId;
      obj['lookupViewId'] = this.field.lookupViewId;
    }
    const res = await this.dynamicFormService.postSaveLookupChanges(obj);
    console.log('lkp-res', res);
    if (res && res.isSuccess == true) {
      this.EditForm.value['lookupViewId'] = res.message;
      // this.EditForm.patchValue({ lookupViewId: res.message })

      this.changesArr.push('lookupViewId');
    } else {
      this.EditForm.value['lookupViewId'] = this.field['lookupViewId']
        ? this.field['lookupViewId']
        : null;
    }
  }

  private async setupAtsLookupChange() {
    // verify for option changes
    if (!this.isAddField && !this.isAtsLookupOptionChanged()) {
      return;
    }

    let obj: lookupObj = {
      applicationFormId: this.formProperty.applicationFormId,
      lookups: this.EditForm.value['custTypeArr1'],
    };

    if (!this.isAddField) {
      obj['formFieldId'] = this.field.formFieldId;
      obj['lookupViewId'] = this.field.lookupViewId;
    }

    const res = await this.dynamicFormService.postSaveLookupChanges(obj);

    console.log('lkp-res', res);

    if (res && res.isSuccess == true) {
      this.EditForm.value['lookupViewId'] = res.message;
      this.changesArr.push('lookupViewId');
    } else {
      this.EditForm.value['lookupViewId'] = this.field['lookupViewId']
        ? this.field['lookupViewId']
        : null;
    }
  }

  private async uploadfiles() {
    if (this.filesContainer.length < 1) return;
    for (let idx = 0; idx < this.filesContainer.length; idx++) {
      const item = this.filesContainer[idx];
      const response = await this.dynamicFormService.postSaveUploadedFile(item.fileData);
      console.log(`${idx + 1} file-upload`, response);
      if (response && response.isSuccess == true)
        this.EditForm.controls[item.prop].setValue(response.message);
      else {
        console.error(response.message);
        this.EditForm.value[item.prop] = this.field[item.prop];
      }
    }
    this.filesContainer = [];
  }

  private async saveDependencyChanges() {
    if (!this.isDependentDataChanges) return;
    // api call
    let data = this.EditForm.value['custTypeForDependency'];

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
      console.error(result.message);
      return;
    }
  }

  /** final Buttons */

  validateSave(): boolean {
    if (this.isAddField || this.filesContainer.length > 0) return true;
    this.verifyFormChangeDetection();
    this.validateDependency();
    if (this.isSaveEnabled &&
      this.EditForm.value['custTypeArr1'].length == 0 &&
      this.intialFormValue['custTypeArr1'].length != 0
    )
      return false;
    return this.isSaveEnabled;
  }

  async saveChanges() {
    if (this.EditForm.invalid || !this.validateSave()) {
      console.error('Please fill required value');
      return;
    }

    // Validations for I Agree Button
    if (this.currentCat.catId == 6) {
      if (!this.Validate_IAgreeButton()) {
        return;
      }
    }

    // This Work is only for Merge Tag Bindings , when they are not yes no lookups ( a special case for switch case)
    // Merge Tag Flow should only work for Support User remove this Condition if you want it to work everywhere same
    if (this.isSupportUser) {
      if (this.EditForm.get('mergeTagName').value != null && !this.isYesNoLookup()) {
        this.bindMergeTagsToOptions();
      }
    }

    if (false) {
        console.error('Something went wrong');
        return;
    } else {
      await this.saveDependencyChanges();

      await this.setValuesToField(this.EditForm.value);

      // Code to Check if DocumentCollection Control is Present , if it is then Update TabIndex of Newly added Control & also Update TabIndex of DocumentCollection Control
      let ReOrderingData = null;
      if (this.isAddField) {
        ReOrderingData = this.reOrderingDocumentControl();
      }

      // General Call To Update or Add Fields ( flow before document Reordering Code)
      this.updatePropChanges.emit({ isDependencyCRUD: this.isDependentDataChanges, field: this.field, changes: this.changesArr });

      // Code to Re-Order Document Control's Position
      if (ReOrderingData != null && this.isAddField) {
        this.updateDocumentCollectionControlOrder(ReOrderingData);
      }

      if (this.field?.controlType == "ClientReport") {
        window.scrollTo({
          top: document.body.scrollHeight - 2000,
          behavior: 'smooth' // Smooth scrolling
        });
      }
    }

    this.bsCanvas.hide();
  }

  cancelChanges() {
    this.bsCanvas.hide();
    if (this.isAddField)
      this.updatePropChanges.emit({ isNewAndCanceled: true, changes: [] });
    else this.updatePropChanges.emit({ changes: [] });
  }

  private reOrderingDocumentControl() {
    // Flatten all columns into a single array to check if the Previos control is DocumentCollection or not , if it is then Move it to Last Position.
    const allColumns = this.section.rows.flatMap(row => row.columns);
    if (allColumns.length < 2) return null;
    const secondLastElement = allColumns[allColumns.length - 2];

    if (secondLastElement.controlType === "DocumentCollection") {
      // Switch Tab Index of New Field & Previous DocumentCollection Control to push Document into last Place
      this.field.tabIndex = secondLastElement.tabIndex;
      secondLastElement.tabIndex = this.field.tabIndex + 1;

      // Switch Column of New Field & Previous DocumentCollection Control to switch their Positions
      let temp = this.field.columnIndex;
      this.field.columnIndex = secondLastElement.columnIndex;
      secondLastElement.columnIndex = temp;

      return secondLastElement;
    }
    return null;
  }

  private updateDocumentCollectionControlOrder(docCollectionControl: any) {
    crudChangeObj.ADD = [];
    this.changesArr.push('tabIndex');
    docCollectionControl.isNewField = false;
    this.updatePropChanges.emit({ isDependencyCRUD: false, field: docCollectionControl, changes: this.changesArr });
  }

  removeFormArrayElement(prop: any, index: number) {
    const data: any = this.EditForm.get(prop);
    data.removeAt(index);

    if (this.currentCat.catId == 3) {
      this.enableMergeTagForSingleChoice();
      this.updateMergeTagVisibilityBasedOnArray(); // Toggle visibility of Yes&No Lookups Merge Tags Only
    }
  }

  dropdownInputChanges() {
    // Listen to Merge Tag Changes for auto-fill
    this.listenToMergeTagChanges();

    // check for yes/No Lookups when single choice is selected
    if (this.currentCat.catId == 3) {
      this.enableMergeTagForSingleChoice();
    }
  }

  protected listenToMergeTagChanges() {
    // Additional Condition to check if Merge Tag Name is not null when auto filling
    if (this?.EditForm?.get('mergeTagName')?.value != null && this?.EditForm?.get('mergeTagName')?.value?.trim() != '' && !this.isYesNoLookup()) {
      // Enable this featrue Only when FormField or Field is created for the first time. It auto fills lookupValues In MergeTags
      // if(this.field.lookUps == undefined && !this.isUserEditingMergeTags){

      const isLookupUndefinedOrEmpty = !this.field?.lookUps || this.field.lookUps.length === 0;
      const isEditingDisabled = !this.isUserEditingMergeTags;
      const isSpecialCategory = Number(this.currentCat?.catId) === 3;
      const hasLookupKeyZero = this.field?.lookUps?.[0]?.lookupKeyId === 0;

      if ((isLookupUndefinedOrEmpty && isEditingDisabled) || (isSpecialCategory && hasLookupKeyZero && isEditingDisabled)) {
        const formArray = this.EditForm.get('custTypeArr1') as FormArray;
        formArray.controls.forEach((item: any) => {
          const data = this.removeSpaces(item.value.value);
          item.patchValue({ mergeTagName: data });
        });
      }
    }
  }

  public onRxSelectChange(event: any, prop: string) {
    if (!event?.item) return;

    switch (prop) {
      case 'atsPropertyValue':
        this.handleAtsPropertyValueChange(event);
        break;

      case 'atsPropertyId':
        this.handleAtsPropertyIdChange(event);
        break;

      case 'custTypeCandidateAtsPropertyValue':
        this.handleAtsPropertyValueChange(event);
        break;
    }
  }

  private confirmAtsMappingChange() {
    console.log('ATS mapping confirmation not available in simplified POC');
    return Promise.resolve({ isConfirm: false });
  }

  private handleAtsPropertyValueChange(event: any) {
    // Auto Lookup Generation for ATS Property Value
    // ATS integration disabled for simplified POC
  }

  private setVincereCustomFieldLookups(key: string) {
    try {
      if (key) {
        this._atsLookupService.getVincereCustomFieldLookups(key).subscribe((res) => {

          if (!res.success) {
            console.error('Error fetching Vincere Custom Field Lookups');
            return;
          }

          if (res.values && res.values.length == 0) {
            console.error('No options found for the selected ATS Property value');
            return;
          }

          if (res.success && res.values && res.values.length > 0) {
            this.isAtsLookups = true;
            this.addAtsLookupOptions("custTypeArr1", res.values);
          }
          else {
            console.error('Error fetching ATS Lookups');
          }

        });
      }
      else {
        console.warn('No key provided for Vincere Custom Field Lookups');
      }
    }
    catch (error) {
      console.error('Error parsing ATS Lookup:', error);
    }
  }

  private setBullhornCustomFieldLookups(Item: any) {
    try {
      if (Item?.dataSourceUrl !== null && Item?.options === null) {
        this._atsLookupService.getBullhornCustomFieldLookups(Item.dataSourceUrl).subscribe((res) => {

          if (!res.success) {
            console.error('Error fetching Bullhorn Custom Field Lookups');
            return;
          }

          if (res.values && res.values.length == 0) {
            console.error('No options found for the selected ATS Property value');
            return;
          }

          if (res.success && res.values && res.values.length > 0) {
            this.isAtsLookups = true;
            this.addAtsLookupOptions("custTypeArr1", res.values);
          }
          else {
            console.error('Error fetching ATS Lookups');
          }

        });
      }
      else if (Item?.options !== null) {
        // Process Data from options
        const mapBullhornCustomFieldLookups = (optionsJson: string | null): ILkpOptionArr[] => {
          if (!optionsJson) return [];

          try {
            const parsed = JSON.parse(optionsJson) as { value: string; label: string }[];

            return parsed.map((opt, index): ILkpOptionArr => ({
              id: index + 1, // incremental ID starting from 1
              value: opt.label,
              clientLookupCode: opt.value,
            }));
          } catch (error) {
            console.error('Invalid options JSON:', error);
            return [];
          }
        };

        const lookupsData = mapBullhornCustomFieldLookups(Item?.options);
        if (lookupsData?.length > 0) {
          this.isAtsLookups = true;
          this.addAtsLookupOptions("custTypeArr1", lookupsData);
        }
      }
      else {
        console.warn('No key provided for Bullhorn Custom Field Lookups');
      }
    }
    catch (error) {
      console.error('Error parsing ATS Lookup:', error);
    }
  }

  private handleAtsPropertyIdChange(event: any) {
    // Auto Lookup Generation for ATS Property Id
    // ATS integration disabled for simplified POC
  }

  private setVincereCandidateCoreFieldLookups(key: string) {
    try {
      if (key) {
        this._atsLookupService.getVincereCandidateCoreFieldLookups(key).subscribe((res) => {

          if (!res.success) {
            console.error('Error fetching Vincere Candidate/Core Field Options');
            return;
          }

          if (res.values && res.values.length == 0) {
            console.error('No options found for the selected ATS Property');
            return;
          }

          if (res.success && res.values && res.values.length > 0) {
            this.isAtsLookups = true;
            this.addAtsLookupOptions("custTypeArr1", res.values);
          }
          else {
            console.error('Error fetching ATS Lookups');
          }
        });
      }
      else {
        console.warn('No key provided for Vincere Candidate Core Field Lookups');
      }
    } catch (error) {
      console.error('Error parsing ATS Lookup:', error);
    }
  }

  private resetIntegrationFields() {
    this.EditForm.patchValue({
      atsPropertyId: null,
      atsPropertyValue: null,
      objectName: null,
      custTypeIsCustomfieldIntegration: false,
      custTypeIsCorefieldIntegration: false
    });
  }

  private addAtsLookupOptions(prop: string, options: Array<ILkpOptionArr> = []) {
    let arr = <FormArray>this.EditForm.get(prop);
    arr.clear();
    options.forEach((obj) => {
      let frm = this.fb.group({
        id: [obj.id],
        value: [obj.value, [Validators.required]],
        clientLookupCode: [obj.clientLookupCode],
      });
      arr.push(frm);
    });
  }

  private get isAtsLookupGenerationEnabled(): boolean {
    return this.isInProjectClient &&
      [2, 3, 4].includes(this.currentCat.catId) &&
      false; // ATS integration disabled for simplified POC
  }

  get isFieldMapped(): boolean {
    // ATS integration disabled for simplified POC
    return false;
  }

  get isRegenerateAtsLookupsEnabled(): boolean {
    return this.isFieldMapped && this.isAtsLookupGenerationEnabled;
  }

  public regenarateAtsLookups(prop: string) {
    this.confirmAtsMappingChange().then(t => {
      if (t.isConfirm) {
        // ATS integration disabled for simplified POC
      }
    })
  }


  private listenToMergeTagTextBoxChanges() {
    this.EditForm.get('mergeTagName').valueChanges.subscribe((data: any) => {
      // Condition to check is its a Yes & No Lookup In Options for Single Choice, if it is then deactivate Merge Tags for this Options in Single Choice.
      if (!this.isYesNoLookup()) {
        this.showMeregeTagFields(data);
        this.listenToMergeTagChanges(); // Adding it here from NgOnInit , so i can listen it changes & auto fill values on Merge Tag Data Changes instead of Initializing on ngOnInit.
      }

      // Update Merge Tags Only For Yes & No Values, so the user can replace radio & checkbox in docs by getting Pre-Populated Tags from UI
      if (this.currentCat.catId == 3 || this.currentCat.catId == 8) {
        this.singleChoiceYesNoMergeTag();
      }
    });
  }

  private listenToMergeTagRadioButtonChanges() {
    this.EditForm.get('custTypeselectedButtonForYesNoLookups').valueChanges.subscribe((data: any) => {
      // Update Merge Tags Only For Yes & No Values, so the user can replace radio & checkbox in docs by getting Pre-Populated Tags from UI
      if (this.currentCat.catId == 3 || this.currentCat.catId == 8) {
        this.singleChoiceYesNoMergeTag();
      }
    });
  }

  private enableMergeTagForSingleChoice() {
    if (this.currentCat.catId == 3 && this.isYesNoLookup()) {
      this.showMeregeTagFields(null);
      this.emptyOptionMergeTags();
      this.mergeTagForYesNoLookup(); // Code for Single Choice Merge Tags when the Options are (Yes & No)
    }

    if (this.currentCat.catId == 3 && !this.isYesNoLookup()) {
      const data = this.EditForm?.get('mergeTagName')?.value;
      if (data != null && data.trim() != '') {
        this.showMeregeTagFields('data');
        this.listenToMergeTagChanges(); // Adding it here from NgOnInit , so i can listen it changes & auto fill values on Merge Tag Data Changes instead of Initializing on ngOnInit.
      }
      this.mergeTagForYesNoLookup(); // Code for Single Choice Merge Tags when the Options are (Yes & No)
    }

    // Toggle visibility of Yes&No Lookups Merge Tags Only
    this.updateMergeTagVisibilityBasedOnArray();
  }

  private mergeTagForYesNoLookup() {
    // This Code is Written Specifically for Single Choice Control when it has Only (Yes & No) as (Options Or LookUps)
    if (this.isSupportUser && (this.currentCat.catId == 3 || this.currentCat.catId == 8)) {
      const showMergeTagRadio = this.propList.findIndex(obj => obj.prop === "custTypeselectedButtonForYesNoLookups");
      const showMergeTagYesLookup = this.propList.findIndex(obj => obj.prop === "custTypeInputForYesLookups");
      const showMergeTagNoLookup = this.propList.findIndex(obj => obj.prop === "custTypeInputForNoLookups");
      const mergeTag = this.EditForm?.get('mergeTagName')?.value?.trim();
      const isMergeTagEmpty = !mergeTag || mergeTag.trim() === '';

      if (this.isYesNoLookup() && !isMergeTagEmpty) {
        if (showMergeTagRadio !== -1) {
          this.propList[showMergeTagRadio].propIsVisible = true;
          this.propList[showMergeTagYesLookup].propIsVisible = true;
          this.propList[showMergeTagNoLookup].propIsVisible = true;
        }
      } else {
        if (showMergeTagRadio !== -1) {
          this.propList[showMergeTagRadio].propIsVisible = false;
          this.propList[showMergeTagYesLookup].propIsVisible = false;
          this.propList[showMergeTagNoLookup].propIsVisible = false;
        }
      }
    }
  }

  private singleChoiceYesNoMergeTag(): void {
    const mergeTag = this.EditForm?.get('mergeTagName')?.value?.trim();
    const selectedButton = this.EditForm?.get('custTypeselectedButtonForYesNoLookups')?.value;
    const isMergeTagEmpty = !mergeTag || mergeTag.trim() === '';

    // Update Yes/No merge tag fields based on input
    this.EditForm.patchValue({
      custTypeInputForYesLookups: isMergeTagEmpty ? null : `${mergeTag}_Yes${selectedButton}`,
      custTypeInputForNoLookups: isMergeTagEmpty ? null : `${mergeTag}_No${selectedButton}`
    });

    // Toggle visibility based on mergeTag
    this.toggleMergeTagVisibility(!isMergeTagEmpty);
  }

  // Code specially written for Single Choice & Skills Control when it has Only (Yes & No) as (Options Or LookUps)
  private toggleMergeTagVisibility(isVisible: boolean): void {
    const fieldsToToggle = [
      'custTypeselectedButtonForYesNoLookups',
      'custTypeInputForYesLookups',
      'custTypeInputForNoLookups'
    ];

    fieldsToToggle.forEach(propName => {
      const index = this.propList.findIndex(item => item.prop === propName);
      if (index !== -1) {
        this.propList[index].propIsVisible = isVisible;
      }
    });
  }

  private updateMergeTagVisibilityBasedOnArray(): void {
    const arr = this.EditForm?.get('custTypeArr1') as FormArray;
    const mergeTag = this.EditForm?.get('mergeTagName')?.value?.trim();
    const isMergeTagEmpty = !mergeTag || mergeTag.trim() === '';
    const shouldShow = arr?.length < 3 && this.isYesNoLookup() && !isMergeTagEmpty;
    this.toggleMergeTagVisibility(shouldShow);
  }

  private emptyOptionMergeTags() {
    const formArray = this.EditForm.get('custTypeArr1') as FormArray;
    formArray.controls.forEach((item: any) => {
      item.patchValue({ mergeTagName: null });
    });
  }

  private showMeregeTagFields(value: any) {
    const showMergeTagOptions = this.propList.findIndex(obj => obj.prop === "custTypeShowMergeTagOptions");

    // Merge Tag Flow should only work for Support User remove this Condition if you want it to work everywhere same
    if (this.isSupportUser) {
      if (showMergeTagOptions !== -1) {
        this.propList[showMergeTagOptions].propIsVisible = (value == null || value == undefined || value?.trim() == '') ? false : true;

        // Hide Options Merge Tags Fields if Primary Merge Tag is null or empty
        if (this.propList[showMergeTagOptions].propIsVisible == false) {
          this.EditForm.patchValue({ custTypeShowMergeTagOptions: false });
        }
      }
    }
  }

  protected getMergeTagPrefix(value: any): string | null {
    if (value != null && typeof value === 'string' && value?.trim()) {
      return value.replace(/\s+/g, '') + '_';
    }
    return null;
  }

  private getMergeTagSuffix(value: any): string | null {
    if (typeof value === 'string' && value.trim() !== '') {
      // Prioritize checking if the value ends with '_C' or '_R'
      if (value.endsWith('_C')) return '_C';
      if (value.endsWith('_R')) return '_R';
    }

    // If value is null, undefined, or doesn't end with _C/_R, check form value
    if (this.field?.lookUps) {
      const type = this.EditForm.get('custTypeselectedButtonForMergeTag')?.value;
      return type ?? '_R'; // Return form value if available, else default to '_R'
    }

    return '_R'; // Default fallback
  }

  private removeMergeTagSuffix(value: any): string | null {
    if (!value || typeof value !== 'string' || value?.trim() === '') {
      return null;
    }

    if (value.endsWith('_C')) {
      return value.slice(0, -2);
    } else if (value.endsWith('_R')) {
      return value.slice(0, -2);
    }

    return value;
  }

  protected removeSpaces(value: any): string | null {
    if (value != null && typeof value === 'string' && value?.trim()) {
      return value.replace(/\s+/g, '');
    }
    return null;
  }

  protected toggleMergeTagEditStatus() {
    this.isUserEditingMergeTags = true;
  }

  private bindMergeTagsToOptions() {
    const Suffix = this.EditForm.get('custTypeselectedButtonForMergeTag').value;
    const formArray = this.EditForm.get('custTypeArr1') as FormArray;
    let isAnyTagNull: boolean = false;
    const isAdvanceTagActive: boolean = this.EditForm.get('custTypeShowMergeTagOptions').value;
    formArray.controls.forEach((item: FormGroup) => {
      // Remove all validators before Saving
      item?.get('mergeTagName')?.clearValidators();
      item?.get('mergeTagName')?.updateValueAndValidity();
      const data = this.removeSpaces(item?.value?.mergeTagName);
      item.patchValue({ mergeTagName: data == null ? null : data + Suffix });

      // if any Option Tag is not created then show Warning Message to User.
      if (data == null && isAdvanceTagActive) {
        isAnyTagNull = true;
      }
    });

    // check for empty strings in Merge Tags , if found one assign it to null
    if (this.EditForm?.get('mergeTagName')?.value?.trim()?.length === 0) {
      this.EditForm.patchValue({
        mergeTagName: null
      });
    }

    if (isAnyTagNull && isAdvanceTagActive) {
      console.warn("Some Merge Tags for Options are not created !");
    }
  }

  copyToClipboardForPrimaryMergeStacks(PrimaryTag: any) {
    if (PrimaryTag == null || PrimaryTag?.trim() == '') {
      return;
    }
    // Remove Spaces
    PrimaryTag = this?.removeSpaces(PrimaryTag);
    const addBrackets = "{{" + PrimaryTag + "}}";
    this.copyToClipboard(addBrackets);
  }

  copyToClipboardForMergeStacks(PrefixTag: any, MidTag: any, SuffixTag: any) {
    // Remove null, undefined, and empty strings before joining
    const result = [PrefixTag, MidTag, SuffixTag].filter(tag => tag !== null && tag !== undefined && tag !== '').join('');
    const addBrackets = "{{" + result + "}}";
    this.copyToClipboard(addBrackets);
  }

  copyToClipboard(value: any) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(() => console.log("Merge Tag Name Copied"))
        .catch(() => { console.error("Error Copying Merge Tag Name  to clipboard.") })
    } else {
      const textarea = document.createElement('textarea');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log("Merge Tag Name Copied");
        }
        else {
          console.error("Error Copying Merge Tag Name  to clipboard.");
        }
      } catch (error) {
        console.error("Error Copying Merge Tag Name  to clipboard.")
      }
    }
  }

  private allowedFileTypes_IAgreeButton(isSignReq: boolean) {
    if (this.currentCat.catId == 6 && this.contractThroughMergeTags) {
      const modifyAtIndex = this.propList.findIndex(x => x.propType == 'fileUpload' && x.prop == 'defaultValue');
      if (modifyAtIndex != -1) {
        if (isSignReq) {
          this.propList[modifyAtIndex].attr.fileAccept = ".docx";
          this.propList[modifyAtIndex].attr.userGuideTxt = "Upload a Word document containing a signature merge tag (if applicable) for the user to view and sign. Click here to view the list of available merge tags that can be used in your document.";
        } else {
          this.propList[modifyAtIndex].attr.fileAccept = ".pdf,.docx";
          this.propList[modifyAtIndex].attr.userGuideTxt = "Upload a Word or PDF document containing a signature merge tag (if applicable) for the user to view and sign. Click here to view the list of available merge tags that can be used in your document.";
        }
      }
    }
  }

  private Validate_IAgreeButton(): boolean {
    const sign = this.EditForm?.value?.isSignatureRequired;
    const defaultValue = this.EditForm?.value?.defaultValue?.trim() === "" ? null : this.EditForm?.value?.defaultValue;
    const uploadDocument = this.EditForm?.value?.custTypeForAgreementDoc
    const fileDetail = this.filesContainer.length == 0 ? null : this.filesContainer[0];
    const isDynamicAgreement = this.EditForm?.value?.isDynamicAgreement

    if (fileDetail == null && defaultValue == null && uploadDocument == true && isDynamicAgreement == false) {
      console.error('Please Upload a File');
      return false;
    }

    // allow to save if uploadDocument is false
    if (fileDetail == null && defaultValue == null && uploadDocument == false) {
      return true;
    }

    // allow to save if uploadDocument is true and isDynamicAgreement is true
    if (fileDetail == null && defaultValue == null && uploadDocument == true && isDynamicAgreement == true) {
      return true;
    }

    const fileName = defaultValue != null ? prepareFileName(defaultValue) : prepareFileName(fileDetail.fileData.fileName);

    const fileExt = fileName.split('.').pop()?.toLowerCase();

    if (fileExt === 'pdf' && sign && this.contractThroughMergeTags) {
      console.error('.pdf file is not allowed for signature');
      return false;
    }

    return true;
  }

  enableCopyButton(val: any) {
    return (val == null || val.trim() == '') ? false : true;
  }

  private enableMergeTagValidation(SupportFlag: boolean) {
    const mergeTag = this.EditForm.get('mergeTagName');

    if (SupportFlag) {
      mergeTag?.setValidators([Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]);
    } else {
      mergeTag?.clearValidators();
    }
    mergeTag?.updateValueAndValidity();
  }

  public getErrorMessage(control: AbstractControl | null): string[] {
    if (!control || !(control.touched || control.dirty) || !control.errors) return [];

    const messages: string[] = [];

    if (this.isSupportUser) {
      for (const errorKey in control.errors) {
        switch (errorKey) {
          case 'required':
            messages.push('This field is required.');
            break;

          case 'maxlength':
            messages.push('Maximum allowed characters is 200.');
            break;

          case 'pattern':
            const rawPattern = control.errors?.pattern?.requiredPattern;
            if (rawPattern) {
              const normalizedPattern = rawPattern.replace(/^\/|\/$/g, '');

              const patternMessages: { [key: string]: string } = {
                "^(?!\\s*$)[a-zA-Z0-9]+$": "Only alphanumeric characters are allowed.",
                "[a-zA-Z]+": "Only alphabetic characters allowed.",
                "\\d+": "Only numbers allowed.",
              };

              const message = patternMessages[normalizedPattern];
              if (message != null && message != undefined) {
                messages.push(message);
              }
            }
            break;
        }
      }
    }
    return messages;
  }

  private setDynamicValidation(Form: FormGroup, propData: any): FormGroup {
    propData.forEach(prop => {
      const control = this.EditForm.get(prop.prop);
      if (control && prop?.attr?.validators) {
        control.setValidators(prop.attr.validators);
        control.updateValueAndValidity(); // 🔁 Important to re-evaluate validity
      }
    });
    return Form;
  }
}


export function prepareFileName(fileName: string) {
  let ext = fileName.split('.').pop() || '';
  let nameWithoutExt = fileName.replace(/\.\w+$/, ''); // Remove extension from processing

  let cleanedName = nameWithoutExt.replace(/_\d+$/, '');

  return cleanedName.length > 25
    ? cleanedName.substring(0, 20) + '...' + ext
    : cleanedName + '.' + ext;
}



export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
  }
  catch (e) {
    return false;
  }
  return true;
}
