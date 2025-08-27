import { FieldTypeEnum } from '../Enums/FieldType.enum';

// For compatibility with existing code
export interface applicationFormInfo {
  templateDescription?: any;
  userName?: string;
  lastModifiedDate?: Date;
  formType?: number;
  applicationFormId?: number;
}

export interface DynamicForm {
  id: number;
  title: string;
  sections: Section[];
  applicationFormId?: number; // For compatibility with existing code
  applicationFormInfo?: applicationFormInfo; // For compatibility with existing code
  isInProjectClient?: boolean; // For compatibility with existing code
  stages?: Stages[]; // For compatibility with existing code - alias for sections
}
 
export interface Section {
  id: number;
  title: string;
  orderNo: number;
  subSections: SubSection[];
  formStageId?: number; // For compatibility with existing code
  stageName?: string; // For compatibility with existing code
  stageOrderNo?: number; // For compatibility with existing code
  sections?: Sections[]; // For compatibility with existing code - alias for subSections
}
 
export interface SubSection {
  id: number;
  orderNo: number;
  title: string;
  formFields: FormField[];
  formSectionId?: number; // For compatibility with existing code
  sectionName?: string; // For compatibility with existing code
  sectionKeyName?: string; // For compatibility with existing code
  sectionOrderNo?: number; // For compatibility with existing code
  rows?: Rows[]; // For compatibility with existing code
}
 
export interface FormField {
  id: number;
  type: FieldTypeEnum;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; 
  columnIndex: number; // Changed from 1|2|3 to number for compatibility
  tabIndex: number;
  formFieldId?: number; // For compatibility with existing code
  objectType?: string; // For compatibility with existing code
  fieldGroupId?: number; // For compatibility with existing code
  labelName?: string; // For compatibility with existing code
  atsPropertyValue?: string; // For compatibility with existing code
  isRequired?: boolean; // For compatibility with existing code
}

// Legacy interfaces for compatibility with existing code
export interface Columns extends FormField {
  controlType?: string;
  fieldName?: string;
  isHide?: boolean;
  isNewField?: boolean;
  formSectionId?: number;
  isPostLiveManage?: boolean;
  maxLength?: number;
  isArrayIndex?: boolean;
  lookupViewId?: number;
  value?: any;
  errorMessage?: any;
  imagePath?: string;
  videoPath?: string;
  videoId?: number;
  isReadOnly?: boolean;
  fileUrl?: any;
  fileName?: any;
  fileExt?: any;
  fileType?: any;
  dependentFormFieldColumns?: any[];
  lookUps?: any[];
  answerSpan?: number;
  questionSpan?: number;
  maxColumn?: number;
  isComment?: boolean;
  isSignatureRequired?: boolean;
  commentValue?: any;
  defaultValue?: string;
  fieldClass?: string;
  rowClass?: string;
  additionalInfo?: string;
  fieldAnswer?: any;
  atsPropertyId?: number;
  objectName?: string;
  integratedTo?: number;
  videoIndCtr?: number;
  fieldValidator?: string;
}

export interface Rows {
  columns: Columns[];
  rowClass?: string;
}

export interface Sections extends SubSection {
  formSectionId?: number;
  sectionName?: string;
  sectionKeyName?: string;
  sectionOrderNo?: number;
  isVisibleToApplicant?: boolean;
  questionSpan?: number;
  answerSpan?: number;
  maxColumn?: number;
  rows: Rows[];
  videos?: any[];
  dependentFormFieldColumns?: any[];
  sectionClass?: any;
}

export interface Stages extends Section {
  formStageId?: number;
  stageName?: string;
  stageKeyName?: string;
  stageOrderNo?: number;
  sections: Sections[];
}

export interface ATSMappingResponse {
  clientId?: number;
  clientName?: string;
  ticketsAndLicences?: Array<{ id: number, value: string }>;
  skillList?: Array<{ id: number, value: string, category?: string}>;
  customFieldList?: Array<{ id: number, value: string, type?: string }>;
  documentTypeOrFolder?: Array<{ id: number, value: string }>;
  candidateList?: Array<{ id: number, value: string, type?: string }>;
}

export interface ATSDetailsForExcel {
  clientId?: number;
  clientName?: string;
  ticketsAndLicences?: Array<{ category: string, name: string, atsMapping: string }>;
  skillList?: Array<{ category: string, name: string, atsMapping: string }>;
}

