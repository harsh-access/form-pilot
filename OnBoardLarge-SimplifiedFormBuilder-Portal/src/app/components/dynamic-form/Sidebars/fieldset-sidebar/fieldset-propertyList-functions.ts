import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ILkpOptionArr, IPropList } from 'src/app/view-modal/GeneralModels';

export function getFieldsetPropertyList(category: number): IPropList[] {
  switch (category) {
    case 1: // Tickets & Licences
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'License or Certificate Name', attr: { placeholder: 'Enter License or Certificate Name' } },
        {
          propType: 'switch',
          prop: 'addReferenceNo',
          propLabel: 'Collect Reference / Document Number',
          attr: {
            customClass: "remove_field_section pb-2"
          },
        },
        // {
        //   propType: 'switch',
        //   prop: 'addYearExperience',
        //   propLabel: 'Add Years of Experience',
        //   attr: {
        //     customClass: "remove_field_section pb-2"
        //   },
        // },
        {
          propType: 'switch',
          prop: 'addExpiryDate',
          propLabel: 'Collect Expiry Date',
          attr: {
            customClass: "remove_field_section pb-2"
          },
        },
        {
          propType: 'switch',
          prop: 'addIssueDate',
          propLabel: 'Collect Issue Date',
          attr: {
            customClass: "remove_field_section pb-2"
          },
        },
        // {
        //   propType: 'switch',
        //   prop: 'addLastUsedDate',
        //   propLabel: 'Add Last Used Date',
        //   attr: {
        //     customClass: "remove_field_section pb-2"
        //   },
        // },
        {
          propType: 'switch',
          prop: 'addFrontDoc',
          propLabel: 'Collect Copy of the Document (Front Image)',
          attr: {
            customClass: "remove_field_section pb-2"
          },
        },
        {
          propType: 'switch',
          prop: 'addBackDoc',
          propLabel: 'Collect Copy of the Document (Back Image)',
          attr: {
            customClass: "remove_field_section pb-2"
          },
        },
        {
          propType: 'fileUpload',
          prop: 'bulkSkillDoc',
          propLabel: 'Upload a Document',
          propTab: 1,
          attr: {
            userGuideTxt:
              `To begin, download the Excel template by clicking the "<a href='https://onboardedstorage.blob.core.windows.net/onboardedlarge-document-upload/Demo/documents/Ticket&Licences - V1.xlsx' target='_blank'>Download Template</a>" link. Fill in the required information, and upload the completed Excel file using the "Upload" button above. This allows us to generate your skills, tickets, and licenses based on your input.`,
            isConvert:true
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory?',
          propTab: 1,
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Licenses and Certificates ATS / CRM Fields',
          propTab: 2,
          attr: {
            listArr: []
          }
        },
      ]
      break;
    case 2: // Induction Question
      return [
        { propType: 'text', prop: 'sectionName', propLabel: 'Sub Section Name', attr: { placeholder: 'Enter Sub Section Name', validators: [whitespaceValidator()] } },
        {
          propType: 'radioGrp',
          prop: 'inductionType',
          propLabel: 'Induction Type',
          attr: {
            listArr: [
              { id: 'simpleIndQueSet', value: 'Only Questions' },
              { id: 'imageIndQueSet', value: 'Image & Questions' },
              { id: 'videoIndQueSet', value: 'Video & Questions' },
            ],
          },
        },
        {
          propType: 'text',
          prop: 'videoUrl',
          propLabel: 'Video Link',
          attr: {
            userGuideTxt:
              'Host your video and provide the URL here. You can host your video on any video hosting platform like YouTube and add the link of your video here. Please ensure you use EMBED OPTIONS URL.',
            placeholder: 'https://www.google.com/',
            validators: [whitespaceValidator()],
            dependentOn: { id: 'inductionType', refValue: ['videoIndQueSet'] }
          },
        },
        {
          propType: 'nestedSet',
          prop: 'simpleIndQueSet',
          propLabel: 'Induction Question',
          nestedProps: [ // NestingPropList
            { propType: 'text', prop: 'labelName', propLabel: 'Question', attr: { placeholder: 'Enter Induction Question', validators: [Validators.required, whitespaceValidator()] } },
            {
              propType: 'selectOptionBox',
              prop: 'fieldOptions',
              propLabel: 'Options',
              attr: {
                userGuideTxt:
                  'Provide a list of options for the user to select from. Highlight the correct answer by selecting the radio button. User will be able to select single option.',
                validators: [Validators.required]
              }
            },
          ],
          attr: {
            dependentOn: { id: 'inductionType', refValue: ['simpleIndQueSet'] }
          },
        },
        {
          propType: 'nestedSet',
          prop: 'imageIndQueSet',
          propLabel: 'Induction Question',
          nestedProps: [
            {
              propType: 'text',
              prop: 'imagePath',
              propLabel: 'Image Link',
              attr: {
                userGuideTxt:
                  'Host the image you\'d like to show and provide its URL. Ensure the URL starts with http:// or https://. Example could be https://www.google.com/',
                placeholder: 'https://www.google.com/',
                validators: [Validators.required, whitespaceValidator()]
              }

            },
            {
              propType: 'selectOptionBox',
              prop: 'fieldOptions',
              propLabel: 'Options',
              attr: {
                userGuideTxt:
                  'Provide a list of options for user to select from. User will be able to select single correct options.',
                validators: [Validators.required]

              }
            },
          ],
          attr: {
            dependentOn: { id: 'inductionType', refValue: ['imageIndQueSet'] }
          },
        },
        {
          propType: 'nestedSet',
          prop: 'videoIndQueSet',
          propLabel: 'Induction Question',
          nestedProps: [
            { propType: 'text', prop: 'labelName', propLabel: 'Question', attr: { placeholder: 'Enter Induction Question', validators: [Validators.required, whitespaceValidator()] }, },
            {
              propType: 'selectOptionBox',
              prop: 'fieldOptions',
              propLabel: 'Options',
              attr: {
                userGuideTxt:
                  'Provide a list of options for user to select from. User will be able to select single correct options.',
                validators: [Validators.required]
              }
            },
          ],
          attr: {
            dependentOn: { id: 'inductionType', refValue: ['videoIndQueSet'] }
          },
        },
      ];
      break;
    default:
      return [];
      break;
  }
}

export function prepareDynamicFormGroup(propList: Array<IPropList>): FormGroup {
  const dynamicFormGroup = new FormGroup({});
  propList?.forEach(param => {
    let value = (param?.attr?.defaultValue) ? param?.attr?.defaultValue : null;
    switch (param.propType) {
      case 'text':
      case 'miniText':
      case 'miniNumText':
      case 'textarea':
      case 'select':
      case 'checkbox':
      case 'switch':
      case 'range':
      case 'radioBtnPair':
      case 'radioGrp':
        dynamicFormGroup.addControl(param.prop, new FormControl(value, param?.attr?.validators ? param?.attr?.validators : []));
        break;
      case 'optionBox':
        dynamicFormGroup.addControl(param.prop, new FormArray([], param?.attr?.validators ? param?.attr?.validators : []));
        break;
      case 'selectOptionBox':
        dynamicFormGroup.addControl(param.prop, new FormGroup({
          selectedOpt: new FormControl(null, Validators.required),
          options: new FormArray([
            new FormGroup({
              id: new FormControl(1),
              value: new FormControl(null, [Validators.required, whitespaceValidator()])
            }),
            new FormGroup({
              id: new FormControl(2),
              value: new FormControl(null, [Validators.required, whitespaceValidator()])
            }),
          ], param?.attr?.validators ? param?.attr?.validators : []),
        }, inductionQuestion()));
        break;
      case 'nestedSet':
        dynamicFormGroup.addControl(param.prop, new FormArray([this.prepareDynamicFormGroup(param.nestedProps)]));
        break;
      default:
        dynamicFormGroup.addControl(param.prop, new FormControl(value, param?.attr?.validators ? param?.attr?.validators : []));
    }
  });
  return dynamicFormGroup;
}

export function inductionQuestion(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selectOptionBoxGroup = control as FormGroup;
    const options = selectOptionBoxGroup.get('options') as FormArray;
    const texts = options.controls.map((formGroup: any) => formGroup.get('value').value);
    const duplicates = texts.filter((value: string, index, array) => (value && value.trim()) && array.indexOf(value) !== index);
    if (duplicates.length > 0) {
      return { UniqueOption: true }
    }

    if (texts.findIndex((x: string | null) => (!x || !x.trim())) > -1) {
      return { EmptyOption: true };
    }

    if (options && options.value && options.value.length < 2) {
      return { MinOption: true };
    }

    if (selectOptionBoxGroup.get('selectedOpt').invalid) {
      return { SelectedOpt: true };
    }

    return null;
  };
}

export function whitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && value.trim() === '') {
      return { whitespace: true };
    }
    return null;
  };
}

export enum OnboardedObjectTypes {
  licencename = 'licensename',
  referencenumber = 'referencenumber',
  yearexperience = 'yearexperience',
  issuedate = 'issuedate',
  expirydate = 'expirydate',
  lastused = 'lastuseddate',
  frontdocument = 'frontdocument',
  backdocument = 'backdocument',
  skillname = 'skillname'
}

export type InductionQuestion = {
  formFieldId?: number;
  lookupViewId?: number;
  labelName?: string;
  imagePath?: string;
  fieldOptions: {
    options: Array<ILkpOptionArr>;
    selectedOpt: Number;
  }
}

export type InductionSection = {
  formStageId?: number;
  formSectionId?: number;
  fieldGroupId?: number;
  sectionName: string;
  inductionType: string;
  videoUrl?: string;
  inductionQuestion?: InductionQuestion[]
}
