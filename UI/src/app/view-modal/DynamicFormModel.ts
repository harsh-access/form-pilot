// Complete dynamic form structure
export interface DynamicForm {
  id: number;
  title: string;
  sections: Section[];
}
 
// Stage containing multiple sub-sections
export interface Section {
  id: number;
  title: string;
  orderNo: number;
  subSections: SubSection[];
}
 
// Sub-section containing related fields
export interface SubSection {
  id: number;
  orderNo: number;
  title: string;
  formFields: FormField[];
}
 
// Basic form field interface
export interface FormField {
  id: number;
  type: FieldTypeEnum;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; 
  columnIndex: 1 | 2 | 3;
  tabIndex: number;
}
 
 
export enum FieldTypeEnum {
  TextBox = 11,
  DatePicker = 12,
  RadioButton = 14,
  MultilineTextbox = 17,
  DropDown = 18,
  SingleFileUpload = 22,
  Lable = 24,
  MultipleSelectCheckBox = 25,
  SwitchCheckBox = 28,
  LableCheckBox = 65
}