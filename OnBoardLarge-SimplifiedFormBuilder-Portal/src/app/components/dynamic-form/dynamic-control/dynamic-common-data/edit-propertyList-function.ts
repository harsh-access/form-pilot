import { Validators } from "@angular/forms";
import { IntegrationType, OnboardedObjects } from "src/app/Enums/FieldIntegration.enum";
import { IPropList } from "src/app/view-modal/GeneralModels";

export function getEditPropertyList(category: number): IPropList[] {
  switch (category) {
    case 1: // TextBox
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Question Label' },
        {
          propType: 'text',
          prop: 'placeholder',
          propLabel: 'Placeholder',
          attr: {
            userGuideTxt: 'Add input suggestion for the expected response',
          },
        },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
        },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        {
          propType: 'radioBtnPair',
          prop: 'custType1',
          propLabel: null,
          attr: {
            listArr: [
              { id: 'TextBox', value: 'Single line' },
              { id: 'MultilineTextbox', value: 'Multi-line' },
            ],
          },
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        {
          propType: 'miniNumText',
          prop: 'maxLength',
          propLabel: 'Limit Number Of Characters',
          propTab: 1,
          attr: {
            userGuideTxt:
              'Limit the number of characters allowed for this text box (Max : 2000).',
          },
        },
        {
          propType: 'radioGrp',
          prop: 'controlType',
          propLabel: 'Validations',
          propTab: 1,
          attr: {
            listArr: [
              { id: 'TextBox', value: 'Alphanumeric' },
              { id: 'NumericTextBox', value: 'Numeric' },
              { id: 'Email', value: 'Email' },
              { id: 'DatePicker', value: 'Date' },
              { id: 'ContactNumber', value: 'ContactNumber' },
            ],
            dependentOn: { id: 'custType1', refValue: ['TextBox'] },
          },
        },
        {
          propType: 'radioGrp',
          prop: 'fieldValidator',
          propLabel: 'Date Validations',
          propTab: 1,
          attr: {
            listArr: [
              { value: 'Future Date', id: 'futuredate' },
              { value: 'Past Date', id: 'pastdate' },
              { value: 'None', id: 'all' },
            ],
            dependentOn: { id: 'controlType', refValue: ['DatePicker'] },
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        {
          propType: 'textarea',
          prop: 'additionalInfo',
          propLabel: 'Help Text',
          propTab: 1,
          attr: {
            userGuideTxt:
              "Show a description when a user hovers on <span class='fa fa-question-circle'></span>. Use this when you'd like to provide additional info to the user.",
          },
        },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        // New Properties for Merge Tags
        {
          propType: 'switch',
          prop: 'custTypeIsCustomfieldIntegration',
          propLabel: 'Integrate into a Custom field',
          propTab: 2,
          propCategory: "Candidate,CustomFields",
          propIntegrationType: [IntegrationType.CodeHouse, IntegrationType.FastTrack, IntegrationType.Nero, IntegrationType.JobAdder, IntegrationType.Oncore, IntegrationType.StandAlone, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.Vincere, IntegrationType.Salesforce, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'switch',
          prop: 'custTypeIsCorefieldIntegration',
          propLabel: 'Integrate into a Core field',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyId',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Lumary],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Custom Fields',
          propTab: 2,
          propCategory: "CustomFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [true] },
            userGuideTxt: "Choose this option if you have created a custom field in your ATS/CRM solution and need this data to be integrated into that custom field.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeAtsPropertyValue',
          propLabel: 'Notes Type',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.JobAdder],
          propIsVisible: false,
          attr: {
            listArr: [],
            customClass: "remove_field_section pb-2",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeCandidateAtsPropertyValue',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Skills ATS / CRM Fields',
          propCategory: "Skills",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Document Type / Folder',
          propCategory: "Documents",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        }
      ];
      break;
    case 2: // DropDown
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Question Label' },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
        },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        {
          propType: 'optionBox',
          prop: 'custTypeArr1',
          propLabel: 'Options',
          attr: {
            userGuideTxt:
              'Provide your own list of options for user to select from. Enter each option in a new line.',
          },
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        {
          propType: 'textarea',
          prop: 'additionalInfo',
          propLabel: 'Help Text',
          propTab: 1,
          attr: {
            userGuideTxt:
              "Show a description when a user hovers on <span class='fa fa-question-circle'></span>. Use this when you'd like to provide additional info to the user.",
          },
        },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        {
          propType: 'switch',
          prop: 'custTypeShowMergeTagOptions',
          propLabel: 'Advance Merge Tags',
          propTab: 1,
          propIsVisible: false
        },
        {
          propType: 'radioBtnPair',
          prop: 'custTypeselectedButtonForMergeTag',
          propLabel: null,
          propIsVisible: true,
          propTab: 1,
          attr: {
            listArr: [
              { id: '_R', value: 'Radio Button' },
              { id: '_C', value: 'Check Box' }
            ],
            dependentOn: { id: 'custTypeShowMergeTagOptions', refValue: [true] }
          },
        },
        {
          propType: 'mergeTagbox',
          prop: 'custTypeArr1',
          propLabel: 'Merge Tags Names for Options',
          propIsVisible: true,
          propTab: 1,
          attr: {
            userGuideTxt:
              'The Advanced Tag will pull the tag list based on the answer options, allowing you to display the document options as either radio buttons or checkboxes for easier selection. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTagOptions', refValue: [true] }
          },
        },
        // New Properties for Merge Tags
        {
          propType: 'switch',
          prop: 'custTypeIsCustomfieldIntegration',
          propLabel: 'Integrate into a Custom field',
          propTab: 2,
          propCategory: "Candidate,CustomFields",
          propIntegrationType: [IntegrationType.CodeHouse, IntegrationType.FastTrack, IntegrationType.Nero, IntegrationType.JobAdder, IntegrationType.Oncore, IntegrationType.StandAlone, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.Vincere, IntegrationType.Salesforce, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'switch',
          prop: 'custTypeIsCorefieldIntegration',
          propLabel: 'Integrate into a Core field',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyId',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Lumary],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Custom Fields',
          propTab: 2,
          propCategory: "CustomFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [true] },
            userGuideTxt: "Choose this option if you have created a custom field in your ATS/CRM solution and need this data to be integrated into that custom field.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeAtsPropertyValue',
          propLabel: 'Notes Type',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.JobAdder],
          propIsVisible: false,
          attr: {
            listArr: [],
            customClass: "remove_field_section pb-2",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeCandidateAtsPropertyValue',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Skills ATS / CRM Fields',
          propCategory: "Skills",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Document Type / Folder',
          propCategory: "Documents",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        }
      ];
      break;
    case 3: // Single choice
      return [
        {
          propType: 'textarea',
          prop: 'labelName',
          propLabel: 'Question Label',
        },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
        },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        {
          propType: 'switch',
          prop: 'isComment',
          propLabel: 'Collect Additional Info If Yes Selected',
          attr: {
            userGuideTxt:
              "By default, this field will provide Yes / No option. You can provide a comment box to collect additional info from the user if they select 'Yes'",
          },
        },
        {
          propType: 'optionBox',
          prop: 'custTypeArr1',
          propLabel: 'Options',
          attr: {
            userGuideTxt:
              'You can override Yes/No option with your own list of options here. User can select only one of the choices provided.',
          },
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        {
          propType: 'textarea',
          prop: 'additionalInfo',
          propLabel: 'Help Text',
          propTab: 1,
          attr: {
            userGuideTxt:
              "Show a description when a user hovers on <span class='fa fa-question-circle'></span>. Use this when you'd like to provide additional info to the user.",
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        // Radio Button Pair Only For (Yes & No) Options/Lookups. ( Starting of Template)
        {
          propType: 'radioBtnPair',
          prop: 'custTypeselectedButtonForYesNoLookups',
          propLabel: null,
          propIsVisible: true,
          propTab: 1,
          attr: {
            listArr: [
              { id: '_R', value: 'Radio Button' },
              { id: '_C', value: 'Check Box' }
            ],
            userGuideTxt:'By selecting the radio buttons above and copying the text below, you can choose how the options will appear in the document — either as radio buttons or checkboxes.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] }
          },
        },
        {
          propType:'copyText',
          prop:'custTypeInputForYesLookups',
          propLabel:null,
          propIsVisible:true,
          propTab: 1,
          attr:{
            customClass : 'pt-4',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] }
          }
        },
        {
          propType:'copyText',
          prop:'custTypeInputForNoLookups',
          propLabel:null,
          propIsVisible:true,
          propTab: 1,
          attr:{
            // customClass : 'pt-4',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] }
          }
        },
        // Radio Button Pair Only For (Yes & No) Options/Lookups. ( Ending of Template)
        {
          propType: 'switch',
          prop: 'custTypeShowMergeTagOptions',
          propLabel: 'Advance Merge Tags',
          propTab: 1,
          propIsVisible: false
        },
        {
          propType: 'radioBtnPair',
          prop: 'custTypeselectedButtonForMergeTag',
          propLabel: null,
          propIsVisible: true,
          propTab: 1,
          attr: {
            listArr: [
              { id: '_R', value: 'Radio Button' },
              { id: '_C', value: 'Check Box' }
            ],
            dependentOn: { id: 'custTypeShowMergeTagOptions', refValue: [true] }
          },
        },
        {
          propType: 'mergeTagbox',
          prop: 'custTypeArr1',
          propLabel: 'Merge Tags Names for Options',
          propIsVisible: true,
          propTab: 1,
          attr: {
            userGuideTxt:
              'The Advanced Tag will pull the tag list based on the answer options, allowing you to display the document options as either radio buttons or checkboxes for easier selection. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTagOptions', refValue: [true] }
          },
        },
        // New Properties for Merge Tags
        {
          propType: 'switch',
          prop: 'custTypeIsCustomfieldIntegration',
          propLabel: 'Integrate into a Custom field',
          propTab: 2,
          propCategory: "Candidate,CustomFields",
          propIntegrationType: [IntegrationType.CodeHouse, IntegrationType.FastTrack, IntegrationType.Nero, IntegrationType.JobAdder, IntegrationType.Oncore, IntegrationType.StandAlone, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.Vincere, IntegrationType.Salesforce, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'switch',
          prop: 'custTypeIsCorefieldIntegration',
          propLabel: 'Integrate into a Core field',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyId',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Lumary],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Custom Fields',
          propTab: 2,
          propCategory: "CustomFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Bullhorn, IntegrationType.Rdb,IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [true] },
            userGuideTxt: "Choose this option if you have created a custom field in your ATS/CRM solution and need this data to be integrated into that custom field.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeAtsPropertyValue',
          propLabel: 'Notes Type',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.JobAdder],
          propIsVisible: false,
          attr: {
            listArr: [],
            customClass: "remove_field_section pb-2",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeCandidateAtsPropertyValue',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Skills ATS / CRM Fields',
          propCategory: "Skills",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Document Type / Folder',
          propCategory: "Documents",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        }
      ];
      break;
    case 4: // Multiple choice
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Question Label' },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
        },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        {
          propType: 'optionBox',
          prop: 'custTypeArr1',
          propLabel: 'Options',
          attr: {
            userGuideTxt:
              'Provide a list of options for user to select from. Enter each option in a new line. User will be able to select multiple options in the list',
          }
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        {
          propType: 'textarea',
          prop: 'additionalInfo',
          propLabel: 'Help Text',
          propTab: 1,
          attr: {
            userGuideTxt:
              "Show a description when a user hovers on <span class='fa fa-question-circle'></span>. Use this when you'd like to provide additional info to the user.",
          },
        },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        {
          propType: 'switch',
          prop: 'custTypeShowMergeTagOptions',
          propLabel: 'Advance Merge Tags',
          propTab: 1,
          propIsVisible: false
        },
        {
          propType: 'radioBtnPair',
          prop: 'custTypeselectedButtonForMergeTag',
          propLabel: null,
          propIsVisible: true,
          propTab: 1,
          attr: {
            listArr: [
              { id: '_R', value: 'Radio Button' },
              { id: '_C', value: 'Check Box' }
            ],
            dependentOn: { id: 'custTypeShowMergeTagOptions', refValue: [true] }
          },
        },
        {
          propType: 'mergeTagbox',
          prop: 'custTypeArr1',
          propLabel: 'Merge Tags Names for Options',
          propIsVisible: true,
          propTab: 1,
          attr: {
            userGuideTxt:
              'The Advanced Tag will pull the tag list based on the answer options, allowing you to display the document options as either radio buttons or checkboxes for easier selection. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTagOptions', refValue: [true] }
          },
        },
        // New Properties for Merge Tags
        {
          propType: 'switch',
          prop: 'custTypeIsCustomfieldIntegration',
          propLabel: 'Integrate into a Custom field',
          propTab: 2,
          propCategory: "Candidate,CustomFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.Vincere, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'switch',
          prop: 'custTypeIsCorefieldIntegration',
          propLabel: 'Integrate into a Core field',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyId',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Lumary],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Custom Fields',
          propTab: 2,
          propCategory: "CustomFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [true] },
            userGuideTxt: "Choose this option if you have created a custom field in your ATS/CRM solution and need this data to be integrated into that custom field.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeAtsPropertyValue',
          propLabel: 'Notes Type',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.JobAdder],
          propIsVisible: false,
          attr: {
            listArr: [],
            customClass: "remove_field_section pb-2",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeCandidateAtsPropertyValue',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Skills ATS / CRM Fields',
          propCategory: "Skills",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Document Type / Folder',
          propCategory: "Documents",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        }
      ];
      break;
    case 5: // Label
      return [
        { propType: 'textarea', prop: 'labelName', propLabel: 'Label Text' },
        {
          propType: 'switch', prop: 'controlType', propLabel: 'Add a blue background to highlight this label',
          attr: {
            customClass: "remove_field_section",
          },
        },
        {
          propType: 'text',
          prop: 'placeholder',
          propLabel: 'Link Name',
          attr: {
            placeholder: 'Click here to read our policy',
            customClass: "remove_field_section pb-1 pt-1",
            dependentOn: { id: 'controlType', refValue: [false] }
          },
        },
        {
          propType: 'text',
          prop: 'additionalInfo',
          propLabel: 'Link URL',
          attr: {
            userGuideTxt: "If you'd like to add a URL for user to click on in the label, use the above option to provide text for the URL and the actual URL for your users to click on . Ensure the URL starts with http:// or https://. Example could be https://www.google.com/",
            placeholder: 'https://www.google.com/',
            customClass: "remove_field_section",
            dependentOn: { id: 'controlType', refValue: [false] }
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 }
      ];
      break;
    case 6: // Declarations
      return [
        {
          propType: 'textarea',
          prop: 'labelName',
          propLabel: ' Declaration Statement',
        },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
          attr: {
            dependentOn: { id: 'isSignatureRequired', refValue: [false] },
          },
        },
        {
          propType: 'switch',
          prop: 'custTypeForAgreementDoc',
          propLabel: 'Do You Want To Upload Document?',
        },
        {
          propType: 'switch',
          prop: 'isSignatureRequired',
          propLabel: 'Do You Need User To Sign A Document?',
          attr: {
            dependentOn: { id: 'custTypeForAgreementDoc', refValue: [true] },
          },
        },
        {
          propType: 'switch',
          prop: 'custTypeForDynamicAgreementShow',
          propLabel: 'custTypeForDynamicAgreementShow',
          propIsVisible: false,
        },
        {
          propType: 'switch',
          prop: 'isDynamicAgreement',
          propLabel: 'Do You want to upload document at invitation time?',
          attr: {
            dependentOn: { id: 'custTypeForDynamicAgreementShow', refValue: [true] },
          },
        },
        {
          propType: 'switch',
          prop: 'custTypeForDynamicAgreement',
          propLabel: 'custTypeForDynamicAgreement',
          propIsVisible: false,
        },
        {
          propType: 'text',
          prop: 'placeholder',
          propLabel: 'URL Text',
          attr: {
            placeholder: 'Click here to read our policy',
            userGuideTxt:
              "If you'd like to add a URL for user to click on, use this option to provide text for the URL. Example could be 'Click here to read our Privacy Policy'",
            dependentOn: { id: 'isSignatureRequired', refValue: [false] },
          },
        },
        {
          propType: 'text',
          prop: 'additionalInfo',
          propLabel: 'URL',
          attr: {
            userGuideTxt:
              'Use this option to provide the actual URL for your users to click on. Ensure the URL starts with http:// or https://. Example could be https://www.google.com/',
            placeholder: 'https://www.google.com/',
            dependentOn: { id: 'custTypeForAgreementDoc', refValue: [false] },
          },
        },
        {
          propType: 'fileUpload',
          prop: 'defaultValue',
          propLabel: 'Upload A Document To View/Sign',
          attr: {
            userGuideTxt:
              'Upload a Word or PDF document containing a signature merge tag (if applicable) for the user to view and sign. Click here to view the list of available merge tags that can be used in your document.',
            dependentOn: { id: 'custTypeForDynamicAgreement', refValue: [true] },
            fileAccept: ".pdf,.docx",
            isConvert: true
          },
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        // New Properties for Merge Tags
        {
          propType: 'radioGrp',
          prop: 'integratedTo',
          propLabel: 'Integrate to',
          propTab: 2,
          attr: {
            listArr: [
              { id: 1, value: 'ATS / CRM Platform' },
              { id: 2, value: 'Payroll Platform' },
              { id: 3, value: 'Do Not Integrate' },
            ],
            dependentOn: { id: 'isSignatureRequired', refValue: [true] }
          },
        }
      ];
      break;
    case 7: // Document Upload
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Document Name' },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
        },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        {
          propType: 'switch',
          prop: 'controlType',
          propLabel: 'Make This “Additional Document” Collection Box',
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Use this option if you like the user to upload any other document of their choice. Note : Users are only allowed to upload files with the extension of docx, pdf, txt',
          },
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        {
          propType: 'textarea',
          prop: 'additionalInfo',
          propLabel: 'Help Text',
          propTab: 1,
          attr: {
            userGuideTxt:
              "Show a description when a user hovers on <span class='fa fa-question-circle'></span>. Use this when you'd like to provide additional info to the user.",
          },
        },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        // New Properties for Merge Tags
        {
          propType: 'radioGrp',
          prop: 'integratedTo',
          propLabel: 'Integrate to',
          propTab: 2,
          attr: {
            listArr: [
              { id: 1, value: 'ATS / CRM Platform' },
              { id: 2, value: 'Payroll Platform' },
              { id: 3, value: 'Do Not Integrate' },
            ],
          },
        },
        {
          propType: 'text',
          prop: 'placeholder',
          propLabel: 'Provide the File Name to be used for this document',
          propTab: 2,
          attr: {
            placeholder: "File Name", customClass: "remove_field_section pb-2", dependentOn: { id: 'controlType', refValue: [false] }
          },
        },
        {
          propType: 'switch',
          prop: 'custTypeIsAppendName',
          propTab: 2,
          propLabel: "Append Candidate's Last Name, First Name to the File Name",
        },
        {
          propType: 'switch',
          prop: 'custTypeIsCustomfieldIntegration',
          propLabel: 'Integrate into a Custom field',
          propTab: 2,
          propCategory: "Candidate,CustomFields",
          propIntegrationType: [IntegrationType.CodeHouse, IntegrationType.FastTrack, IntegrationType.Nero, IntegrationType.JobAdder, IntegrationType.Oncore, IntegrationType.StandAlone, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.Vincere, IntegrationType.Salesforce, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyId',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Custom Fields',
          propTab: 2,
          propCategory: "CustomFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [true] },
            userGuideTxt: "Choose this option if you have created a custom field in your ATS/CRM solution and need this data to be integrated into that custom field.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeAtsPropertyValue',
          propLabel: 'Notes Type',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.JobAdder],
          propIsVisible: false,
          attr: {
            listArr: [],
            customClass: "remove_field_section pb-2",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeCandidateAtsPropertyValue',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.Bullhorn, IntegrationType.Rdb, IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Skills ATS / CRM Fields',
          propCategory: "Skills",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Document Type / Folder',
          propCategory: "Documents",
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'integratedTo', refValue: [1, 2] },
          },
          propTab: 2
        }
      ];
      break;
    case 8://Skills
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Question Label' },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
        },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        {
          propType: 'fileUpload',
          prop: 'custTypeBulkSkillDoc',
          propLabel: 'Upload a Document',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              `To begin, download the Excel template by clicking the "<a href='https://onboardedstorage.blob.core.windows.net/onboardedlarge-document-upload/Demo/documents/Ticket&Licences - V1.xlsx' target='_blank'>Download Template</a>" link. Fill in the required information, and upload the completed Excel file using the "Upload" button above. This allows us to generate your skills, tickets, and licenses based on your input.`,
            isConvert: true,
            fileAccept: ".xlsx"
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        // New Properties for Merge Tags
        // Radio Button Pair Only For (Yes & No) Options/Lookups. ( Starting of Template)
        {
          propType: 'radioBtnPair',
          prop: 'custTypeselectedButtonForYesNoLookups',
          propLabel: null,
          propIsVisible: true,
          propTab: 1,
          attr: {
            listArr: [
              { id: '_R', value: 'Radio Button' },
              { id: '_C', value: 'Check Box' }
            ],
            userGuideTxt: 'By selecting the radio buttons above and copying the text below, you can choose how the options will appear in the document — either as radio buttons or checkboxes.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] }
          },
        },
        {
          propType: 'copyText',
          prop: 'custTypeInputForYesLookups',
          propLabel: null,
          propIsVisible: true,
          propTab: 1,
          attr: {
            customClass: 'pt-4',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] }
          }
        },
        {
          propType: 'copyText',
          prop: 'custTypeInputForNoLookups',
          propLabel: null,
          propIsVisible: true,
          propTab: 1,
          attr: {
            // customClass : 'pt-4',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] }
          }
        },
        // Radio Button Pair Only For (Yes & No) Options/Lookups. ( Ending of Template)
        {
          propType: 'switch',
          prop: 'custTypeIsCustomfieldIntegration',
          propLabel: 'Integrate into a Custom field',
          propTab: 2,
          propCategory: "Candidate,CustomFields",
          propIsVisible: false,
          attr: {
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'switch',
          prop: 'custTypeIsCorefieldIntegration',
          propLabel: 'Integrate into a Core field',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyId',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Custom Fields',
          propTab: 2,
          propCategory: "CustomFields",
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [true] },
            userGuideTxt: "Choose this option if you have created a custom field in your ATS/CRM solution and need this data to be integrated into that custom field.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeAtsPropertyValue',
          propLabel: 'Notes Type',
          propTab: 2,
          propCategory: "Candidate",
          propIsVisible: false,
          attr: {
            listArr: [],
          }
        },
        // Toggle Skills ATS / CRM Fields between Functional and Industry types
        {
          propType: 'switch',
          prop: 'custTypeSkillCategory',
          propLabel: 'Integrate into a Functional/Sub-Functional',
          propTab: 2,
          propCategory: "Skills",
          propIntegrationType: [IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            userGuideTxt : 'This switch will map the selected skills to the Functional/Sub-Functional Skills section in ATS.'
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Skills ATS / CRM Fields',
          propCategory: "Skills",
          propIsVisible: false,
          attr: {
            listArr: [],
            customClass: "remove_field_section pb-2"
          },
          propTab: 2
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Document Type / Folder',
          propCategory: "Documents",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        }
      ]
      break;
    case 9: // Client PDF
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Report Name' },
        {
          propType: 'fileUpload',
          prop: 'defaultValue',
          propLabel: 'Upload a Word document with merge tags',
          attr: {
            userGuideTxt:
              'Upload a Word document in the format you need to generate the final PDF document. Add the necessary merge tags to the document to merge data from the onboarding form into the final PDF document.',
            isConvert: false,
            fileAccept: ".docx"
          }
        },

        {
          propType: 'radioGrp',
          prop: 'integratedTo',
          propLabel: 'Integrate to',
          propTab: 2,
          attr: {
            listArr: [
              { id: 1, value: 'ATS / CRM Platform' },
              { id: 2, value: 'Payroll Platform' },
              { id: 3, value: 'Do Not Integrate' },
            ],
          },
        },
      ]
      break;
    case 10: // Slider
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Question Label' },
        {
          propType: 'switch',
          prop: 'isRequired',
          propLabel: 'Do You Want To Make It Mandatory',
        },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        {
          propType: 'maxColumnRange',
          prop: 'maxColumn',
          propLabel: 'Adjust MaxColumn',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt:
              'Adjust the width of this field',
          },
        },
        {
          propType: 'columnIndexRange',
          prop: 'columnIndex',
          propLabel: 'Adjust ColumnIndex',
          propTab: 1,
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'maxColumn', refValue: [2, 3] },
            userGuideTxt:
              'Adjust the field position in row',
          },
        },
        {
          propType: 'radioGrp',
          prop: 'maxLength',
          propLabel: 'Range',
          propTab: 1,
          attr: {
            listArr: [
              { id: 5, value: '1-5' },
              { id: 10, value: '1-10' },
            ],
          },
        },
        { propType: 'dependentSelectionPair', prop: 'custTypeForDependency', propLabel: null, propTab: 1 },
        {
          propType: 'textarea',
          prop: 'additionalInfo',
          propLabel: 'Help Text',
          propTab: 1,
          attr: {
            userGuideTxt:
              "Show a description when a user hovers on <span class='fa fa-question-circle'></span>. Use this when you'd like to provide additional info to the user.",
          },
        },
      ];
      break;
    case 100: // Other
      return [
        { propType: 'text', prop: 'labelName', propLabel: 'Question Label' },
        { propType: 'range', prop: 'questionSpan', propLabel: 'Width' },
        // New Properties for Merge Tags
        { propType: 'switch', prop: 'custTypeShowMergeTags', propLabel: 'Do you want to add Merge Tag?', propTab: 1 , propIsVisible: false},
        {
          // propType: 'text',
          propType: 'mergeTagText',
          prop: 'mergeTagName',
          propLabel: 'Merge Tag',
          propTab: 1,
          propIsVisible: false,
          attr: {
            userGuideTxt: 'A merge tag is a small piece of code that lets you insert dynamic data into your documents. You can either use the default values shown above or customize them to suit your needs. Be sure to use the copy button to ensure the merge tag includes the {{}} brackets.',
            dependentOn: { id: 'custTypeShowMergeTags', refValue: [true] },
            validators:[Validators.pattern(/^(?!\s*$)[a-zA-Z0-9]+$/)]
          },
        },
        // New Properties for Merge Tags
        {
          propType: 'switch',
          prop: 'custTypeIsCustomfieldIntegration',
          propLabel: 'Integrate into a Custom field',
          propTab: 2,
          propCategory: "Candidate,CustomFields",
          propIsVisible: false,
          attr: {
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'switch',
          prop: 'custTypeIsCorefieldIntegration',
          propLabel: 'Integrate into a Core field',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2"
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyId',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate,CoreFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Custom Fields',
          propTab: 2,
          propCategory: "CustomFields",
          propIntegrationType: [IntegrationType.JobAdder, IntegrationType.FastTrack, IntegrationType.Vincere, IntegrationType.Bullhorn, IntegrationType.Rdb,IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [true] },
            userGuideTxt: "Choose this option if you have created a custom field in your ATS/CRM solution and need this data to be integrated into that custom field.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeAtsPropertyValue',
          propLabel: 'Notes Type',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.JobAdder],
          propIsVisible: false,
          attr: {
            listArr: [],
            customClass: "remove_field_section pb-2",
          }
        },
        {
          propType: 'rx-select',
          prop: 'custTypeCandidateAtsPropertyValue',
          propLabel: 'ATS / CRM Fields',
          propTab: 2,
          propCategory: "Candidate",
          propIntegrationType: [IntegrationType.Bullhorn, IntegrationType.Rdb,IntegrationType.ARCRM],
          propIsVisible: false,
          attr: {
            listArr: [],
            dependentOn: { id: 'custTypeIsCustomfieldIntegration', refValue: [false] },
            customClass: "remove_field_section pb-2",
            userGuideTxt: "Pick an available field from your ATS / CRM solution to integrate this data into.",
          }
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Skills ATS / CRM Fields',
          propCategory: "Skills",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        },
        {
          propType: 'rx-select',
          prop: 'atsPropertyValue',
          propLabel: 'Document Type / Folder',
          propCategory: "Documents",
          propIsVisible: false,
          attr: {
            listArr: []
          },
          propTab: 2
        }
      ];
      break;
    default:
      return [];
      break;
  }
}

export function getStagePropertyList(): IPropList[] {
  return [{ propType: 'text', prop: 'stageName', propLabel: 'Section Name', attr: { placeholder: 'Enter Section Name' } }];
}

export function getSectionPropertyList(isNew: boolean = false): IPropList[] {
  if (isNew)
    return [
      { propType: 'text', prop: 'sectionName', propLabel: 'Sub Section Name', attr: { placeholder: 'Enter Sub Section Name' } }
    ];
  else
    return [
      { propType: 'text', prop: 'sectionName', propLabel: 'Sub Section Name', attr: { placeholder: 'Enter Sub Section Name' } },
    ];
}
