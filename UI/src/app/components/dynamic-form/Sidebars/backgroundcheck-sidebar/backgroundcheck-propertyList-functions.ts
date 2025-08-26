import { Validators } from '@angular/forms';
import { IPropList } from 'src/app/view-modal/GeneralModels';

export interface IBackgorundCheck {
  checkId: number;
  name: string;
  displayName: string;
  country?: string;
  externalProductId?: number;
  orderNo?: number;
  additionalProps: ICheckProperties;
}

export interface ICheckProperties {
  checkDeclaration?: string,
  btnText?: string,

  startCheckOnCandidateSubmit?: boolean,
  workHistoryStatement?: string;

  minYears?: number;
  minEmployments?: number;

  isMaxGapRequired?: boolean;
  maxGap?: number;

  minReferences?: number;
  minReferenceYears?: number;
  
  enableReasonForDoNotContact?: boolean;
  reasonForDoNotContactOptions?: string;

  allowedEmploymentReferences?: boolean;
  minEmploymentReferences?: number;
  refereeQuestionnaire?: string;
  enableReasonForLeaving?: boolean;
  
  allowedAcademicReferences?: boolean;
  minAcademicReferences?: number;
  refereeAcademicQuestionnaire?: number;

  allowedPersonalReferences?: boolean;
  minPersonalReferences?: number;
  refereePersonalQuestionnaire?: number;


  isMrzCheckRequired?: boolean;
  dbsUpdateService?: boolean;
  candidatePay?: boolean;
  includeHandlingFees?: boolean;

  sendEmailOnComplete?: boolean;
  integrationMappings?: Array<IIntegrationMapping>;
}

export interface IIntegrationMapping {
  key: string,
  integrateTo: number,
  documentName?: string,
  dataType?: number,
  objectName?: string,
  atsPropertyId?: number,
  atsPropertyValue?: string,
  addMonthsToExpiryDate?: number,
}

export interface Questionnaire {
    applicationFormId: number,
    applicationFormName: string,
    subFormType: number
}


const checksCategories = {
  BackgroundCheckDeclaration: "BackgroundCheckDeclaration",
  IdentityCheck: "IdentityCheck",
  RapidReferenceCheck: "RapidReferenceCheck",
  DbsENWBasicCheck: "DbsENWBasicCheck",
  DbsBasicScotlandCheck: "DbsBasicScotlandCheck",
  DbsStandardCheck: "DbsStandardCheck",
  DbsEnhancedCheck: "DbsEnhancedCheck",
  RightToWorkCheck: "RightToWorkCheck",
  IdentityCheckHighConfidence: "IdentityCheckHighConfidence",
  EmploymentReferenceCheck: "EmploymentReferenceCheck",
  AdverseFinancialSummaryCheck: "AdverseFinancialSummaryCheck",
  AdverseFinancialDetailCheck: "AdverseFinancialDetailCheck",
  SanctionsCheck: "SanctionsCheck",
  ReferenceCheck: "ReferenceCheck",
  SocialMediaEssentialsCheck: "SocialMediaEssentialsCheck",
  SocialMediaPlusCheck: "SocialMediaPlusCheck",
  DrivingLicenceCheck: "DrivingLicenceCheck",
  AnimalRightsCheck: "AnimalRightsCheck",
  CivilLitigationCheck: "CivilLitigationCheck",
  CIFASCheck: "CIFASCheck",
  DirectorshipCheck: "DirectorshipCheck"
}

export function CheckCategories(): typeof checksCategories {
  return checksCategories;
}

export function getUBCPropertyList(checkName: string): IPropList[] {

  // Check common properties
  let properties: IPropList[] = [];

  switch (checkName) {
    case CheckCategories().BackgroundCheckDeclaration:
      properties = [
        {
          propType: "textarea",
          prop: "checkDeclaration",
          propLabel: "Declaration",
        },
        {
          propType: "text",
          prop: "btnText",
          propLabel: "Button Text",
        }
      ];
      break;
    case CheckCategories().IdentityCheck:
    // case CheckCategories().DrivingLicenceCheck:
    case CheckCategories().AdverseFinancialSummaryCheck:
    case CheckCategories().AdverseFinancialDetailCheck:
    case CheckCategories().SanctionsCheck:
    case CheckCategories().SocialMediaEssentialsCheck:
    case CheckCategories().SocialMediaPlusCheck:
    case CheckCategories().DirectorshipCheck:
    // case CheckCategories().AnimalRightsCheck:
    // case CheckCategories().CivilLitigationCheck:
    // case CheckCategories().CIFASCheck:
      properties = [{
        propType: 'switch',
        prop: 'startCheckOnCandidateSubmit',
        propLabel: 'Start Check on Candidate Submit'
      }]
      break;
    case CheckCategories().RapidReferenceCheck:
      properties = [
        {
          propType: 'textarea',
          prop: 'workHistoryStatement',
          propLabel: 'Work History Statement',
        },
        {
          propType: 'select',
          prop: 'minReferences',
          propLabel: 'Number of References',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
            ]
          }
        },
        {
          propType: 'select',
          prop: 'refereeQuestionnaire',
          propLabel: 'Select Questionnaire for Referee',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
            ]
          }
        }
      ]
    case CheckCategories().EmploymentReferenceCheck:
      properties = [
        {
          propType: 'textarea',
          prop: 'workHistoryStatement',
          propLabel: 'Work History Statement',
        },
        {
          propType: 'select',
          prop: 'minReferences',
          propLabel: 'Years of Experience',
          attr: {
            listArr: [
              { id: 1, value: '2' },
              { id: 2, value: '3' },
              { id: 3, value: '4' },
              { id: 4, value: '5' },
              { id: 5, value: '10' },
            ]
          }
        },
        {
          propType: 'select',
          prop: 'refereeQuestionnaire',
          propLabel: 'Select Questionnaire for Referee',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
            ]
          }
        }
      ]
      if (checkName == CheckCategories().EmploymentReferenceCheck) {
        properties.insert(0, {
          propType: 'switch',
          prop: 'startCheckOnCandidateSubmit',
          propLabel: 'Start Check on Candidate Submit'
        },)
      }
      break;
    // case CheckCategories().RightToWorkCheck:
    //   properties = [
    //     {
    //       propType: 'switch',
    //       prop: 'isMrzCheckRequired',
    //       propLabel: 'MRZ Check to be performed on documents'
    //     }
    //   ]
    //   break;
    case CheckCategories().ReferenceCheck:
      properties = [
        {
          propType: 'textarea',
          prop: 'workHistoryStatement',
          propLabel: 'Work History Statement',
        },
        {
          propType: 'select',
          prop: 'minYears',
          propLabel: 'Minimum Years of Candidate History',
          attr: {
            listArr: [
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
              { id: 10, value: '10' },
              { id: 15, value: '15' },
              { id: 20, value: '20' },
              { id: 25, value: '25' },
              { id: 30, value: '30' },
            ],
            validators: [Validators.required],
            userGuideTxt: "Specifies the minimum number of years of candidate history required, starting from the current year."
          },
        },
        {
          propType: 'select',
          prop: 'minEmployments',
          propLabel: 'Minimum Number of Work Histories',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
              { id: 6, value: '6' },
              { id: 7, value: '7' },
              { id: 8, value: '8' },
              { id: 9, value: '9' },
              { id: 10, value: '10' },
              { id: 11, value: '11' },
              { id: 12, value: '12' },
              { id: 13, value: '13' },
              { id: 14, value: '14' },
              { id: 15, value: '15' },
              { id: 16, value: '16' },
              { id: 17, value: '17' },
              { id: 18, value: '18' },
              { id: 19, value: '19' },
              { id: 20, value: '20' },
              { id: 21, value: '21' },
              { id: 22, value: '22' },
              { id: 23, value: '23' },
              { id: 24, value: '24' },
              { id: 25, value: '25' },
              { id: 26, value: '26' },
              { id: 27, value: '27' },
              { id: 28, value: '28' },
              { id: 29, value: '29' },
              { id: 30, value: '30' }
            ],
            validators: [Validators.required],
            userGuideTxt: "Specifies the minimum number of employment history required, starting from the current year."
          }
        },
        {
          propType: 'switch',
          prop: 'isMaxGapRequired',
          propLabel: 'Gap History',
        },
        {
          propType: 'text',
          prop: 'maxGap',
          propLabel: 'Gap Threshold (In Days)',
          attr: {
            validators: [Validators.pattern(/^[0-9]+$/), Validators.min(1)],
            userGuideTxt: 'If this value is set, gap history will be enabled for the candidates to provide further information if the gap is more than the number of days entered in Gap Threshold.',
            dependentOn: { id: "isMaxGapRequired", refValue: [true] },
          },
        },
        {
          propType: 'select',
          prop: 'minReferenceYears',
          propLabel: 'Minimum Years of Reference',
          attr: {
            listArr: [
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
              { id: 10, value: '10' },
              { id: 15, value: '15' },
              { id: 20, value: '20' },
              { id: 25, value: '25' },
              { id: 30, value: '30' },
            ],
            validators: [Validators.required],
            userGuideTxt: "Specifies the minimum number of years reference coverage required to verify the candidate's history, counted from the current year."
          },

        },
        {
          propType: 'select',
          prop: 'minReferences',
          propLabel: 'Minimum Number of References',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
              { id: 6, value: '6' },
              { id: 7, value: '7' },
              { id: 8, value: '8' },
              { id: 9, value: '9' },
              { id: 10, value: '10' },
              { id: 11, value: '11' },
              { id: 12, value: '12' },
              { id: 13, value: '13' },
              { id: 14, value: '14' },
              { id: 15, value: '15' },
              { id: 16, value: '16' },
              { id: 17, value: '17' },
              { id: 18, value: '18' },
              { id: 19, value: '19' },
              { id: 20, value: '20' },
              { id: 21, value: '21' },
              { id: 22, value: '22' },
              { id: 23, value: '23' },
              { id: 24, value: '24' },
              { id: 25, value: '25' },
              { id: 26, value: '26' },
              { id: 27, value: '27' },
              { id: 28, value: '28' },
              { id: 29, value: '29' },
              { id: 30, value: '30' }
            ],
            validators: [Validators.required],
            userGuideTxt: "Specifies the minimum number of referees required to verify the candidate's history."
          }
        },
        {
          propType: 'switch',
          prop: 'allowedEmploymentReferences',
          propLabel: 'Include Employment References',
        },
        {
          propType: 'select',
          prop: 'minEmploymentReferences',
          propLabel: 'Minimum Number of Employment References',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
              { id: 6, value: '6' },
              { id: 7, value: '7' },
              { id: 8, value: '8' },
              { id: 9, value: '9' },
              { id: 10, value: '10' },
              { id: 11, value: '11' },
              { id: 12, value: '12' },
              { id: 13, value: '13' },
              { id: 14, value: '14' },
              { id: 15, value: '15' },
              { id: 16, value: '16' },
              { id: 17, value: '17' },
              { id: 18, value: '18' },
              { id: 19, value: '19' },
              { id: 20, value: '20' },
              { id: 21, value: '21' },
              { id: 22, value: '22' },
              { id: 23, value: '23' },
              { id: 24, value: '24' },
              { id: 25, value: '25' },
              { id: 26, value: '26' },
              { id: 27, value: '27' },
              { id: 28, value: '28' },
              { id: 29, value: '29' },
              { id: 30, value: '30' }
            ],
            dependentOn: { id: "allowedEmploymentReferences", refValue: [true] },
          }
        },
        {
          propType: 'select',
          prop: 'refereeQuestionnaire',
          propLabel: 'Default Employment Reference Questionnaire',
          attr: {
            dependentOn: { id: "allowedEmploymentReferences", refValue: [true] },
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
            ]
          }
        },
        {
          propType: 'switch',
          prop: 'allowedAcademicReferences',
          propLabel: 'Include Academic References',
        },
        {
          propType: 'select',
          prop: 'minAcademicReferences',
          propLabel: 'Minimum Number of Academic References',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
              { id: 6, value: '6' },
              { id: 7, value: '7' },
              { id: 8, value: '8' },
              { id: 9, value: '9' },
              { id: 10, value: '10' },
              { id: 11, value: '11' },
              { id: 12, value: '12' },
              { id: 13, value: '13' },
              { id: 14, value: '14' },
              { id: 15, value: '15' },
              { id: 16, value: '16' },
              { id: 17, value: '17' },
              { id: 18, value: '18' },
              { id: 19, value: '19' },
              { id: 20, value: '20' },
              { id: 21, value: '21' },
              { id: 22, value: '22' },
              { id: 23, value: '23' },
              { id: 24, value: '24' },
              { id: 25, value: '25' },
              { id: 26, value: '26' },
              { id: 27, value: '27' },
              { id: 28, value: '28' },
              { id: 29, value: '29' },
              { id: 30, value: '30' }
            ],
            dependentOn: { id: "allowedAcademicReferences", refValue: [true] },
          }
        },
        {
          propType: 'select',
          prop: 'refereeAcademicQuestionnaire',
          propLabel: 'Default Academic Reference Questionnaire',
          attr: {
            dependentOn: { id: "allowedAcademicReferences", refValue: [true] },
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
            ]
          }
        },
        {
          propType: 'switch',
          prop: 'allowedPersonalReferences',
          propLabel: 'Include Personal References',
        },
        {
          propType: 'select',
          prop: 'minPersonalReferences',
          propLabel: 'Minimum Number of Personal Reference Checks',
          attr: {
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
              { id: 6, value: '6' },
              { id: 7, value: '7' },
              { id: 8, value: '8' },
              { id: 9, value: '9' },
              { id: 10, value: '10' },
              { id: 11, value: '11' },
              { id: 12, value: '12' },
              { id: 13, value: '13' },
              { id: 14, value: '14' },
              { id: 15, value: '15' },
              { id: 16, value: '16' },
              { id: 17, value: '17' },
              { id: 18, value: '18' },
              { id: 19, value: '19' },
              { id: 20, value: '20' },
              { id: 21, value: '21' },
              { id: 22, value: '22' },
              { id: 23, value: '23' },
              { id: 24, value: '24' },
              { id: 25, value: '25' },
              { id: 26, value: '26' },
              { id: 27, value: '27' },
              { id: 28, value: '28' },
              { id: 29, value: '29' },
              { id: 30, value: '30' }
            ],
            dependentOn: { id: "allowedPersonalReferences", refValue: [true] },
          }
        },
        {
          propType: 'select',
          prop: 'refereePersonalQuestionnaire',
          propLabel: 'Default Personal Reference Questionnaire',
          attr: {
            dependentOn: { id: "allowedPersonalReferences", refValue: [true] },
            listArr: [
              { id: 1, value: '1' },
              { id: 2, value: '2' },
              { id: 3, value: '3' },
              { id: 4, value: '4' },
              { id: 5, value: '5' },
            ]
          }
        },
      ]
      if (checkName == CheckCategories().ReferenceCheck) {
        properties.insert(0, {
          propType: 'switch',
          prop: 'startCheckOnCandidateSubmit',
          propLabel: 'Start Check on Candidate Submit'
        },)
      }
      break;
    case CheckCategories().DbsEnhancedCheck:
    case CheckCategories().DbsStandardCheck:
    case CheckCategories().DbsENWBasicCheck:
    case CheckCategories().DbsBasicScotlandCheck:
    case CheckCategories().RightToWorkCheck:
    case CheckCategories().AnimalRightsCheck:
    case CheckCategories().CivilLitigationCheck:
    case CheckCategories().CIFASCheck:
      properties = [];
      break;
  }

  if (CheckCategories().BackgroundCheckDeclaration != checkName) {
    // Add a universal switch for sending an email on completion
    properties.push({
      propType: 'switch',
      prop: 'sendEmailOnComplete',
      propLabel: 'Receive Completion Notification Email'
    });

    // Add Into Integration Tab for report
    properties.push(
      {
        propType: 'radioGrp',
        prop: 'integrateTo',
        propLabel: 'Integrate report to',
        propTab: 1,
        attr: {
          listArr: [
            { id: 1, value: 'ATS / CRM Platform' },
            { id: 3, value: 'Do Not Integrate' },
          ],
          validators: []
        },
      },
      {
        propType: 'text',
        prop: 'documentName',
        propLabel: 'File Name',
        propTab: 1,
        attr: {
          dependentOn: { id: "integrateTo", refValue: [1] },
          placeholder: "File Name", customClass: "remove_field_section pb-2",
        },
      },
      {
        propType: 'select',
        prop: 'addMonthsToExpiryDate',
        propLabel: 'Expiry Date',
        propTab: 1,
        attr: {
          dependentOn: { id: "integrateTo", refValue: [1] },
          listArr: [
            { id: null, value: 'Not applicable' },
            { id: 6, value: '6 Months' },
            { id: 12, value: '12 Months' },
            { id: 24, value: '24 Months' },
          ],
          userGuideTxt: "Set expiry date to report while integrating to ATS/ CRM",
        }
      },
      {
        propType: 'rx-select',
        prop: 'atsPropertyValue',
        propLabel: 'Document Type/ Credentials',
        propTab: 1,
        attr: {
          dependentOn: { id: "integrateTo", refValue: [1] },
          listArr: [],
        }
      },
      {
        propType: 'rx-select',
        prop: 'arcrmAttribute',
        propLabel: 'Attribute',
        propTab: 1,
        attr: {
          dependentOn: { id: "integrateTo", refValue: [1] },
          listArr: [],
        }
      },
      {
        propType: 'rx-select',
        prop: 'fasttrackSkills',
        propLabel: 'Skills',
        propTab: 1,
        attr: {
          dependentOn: { id: "integrateTo", refValue: [1] },
          listArr: [],
        }
      }
      // {
      //   propType: 'rx-select',
      //   prop: 'arcrmCompliance',
      //   propLabel: 'ARCRM Compliance',
      //   propTab: 1,
      //   attr: {
      //     dependentOn: { id: "integrateTo", refValue: [1] },
      //     listArr: [
      //       { id: 12, value: 'Not applicable' },
      //     ],
      //   }
      // },
    );
  }

  switch (checkName) {
    case CheckCategories().DbsEnhancedCheck:
    case CheckCategories().DbsStandardCheck:
      properties.push({
        propType: 'switch',
        prop: 'dbsUpdateService',
        propLabel: 'DBS Update Service'
      });
    case CheckCategories().DbsBasicScotlandCheck:
    case CheckCategories().DbsENWBasicCheck:
      properties.push(
        {
          propType: 'switch',
          prop: 'candidatePay',
          propLabel: 'Enable Candidate Pay',
          attr: {
            userGuideTxt: 'If enabled, candidate pays for the disclosure check including transaction cost of 1.5% + 20p using their own credit card.',
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'switch',
          prop: 'includeHandlingFees',
          propLabel: 'Include Handling Fees',
          attr: {
            userGuideTxt:
              'If enabled, candidate pays for disclosure check + handling fee including transaction cost of 1.5% + 20p using their own credit card. If this is not enabled, the handling fee will be invoiced to the customer.',
            dependentOn: { id: "candidatePay", refValue: [true] },
          }
        },
      )
      break;
  }

  return properties;
}
