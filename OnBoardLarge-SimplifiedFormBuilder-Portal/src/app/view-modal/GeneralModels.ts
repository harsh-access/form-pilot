import { ValidatorFn } from "@angular/forms";
import { ApiResponseModel, fileUpload } from "./GeneralApiModel";

export interface IPropList {
  propType: string;
  prop: string;
  propLabel: string;
  propCategory?:string;
  propIntegrationType?:string[];
  propIsVisible?:boolean;
  propTab?: number;
  attr?: {
    defaultValue?: string;    
    customClass?: string;
    placeholder?: string;
    userGuideTxt?: string;
    dependentOn?: { id: string; refValue: any[] };
    dataObject?:any;
    listArr?: Array<{ id: any; value: any }>;
    validators?: Array<ValidatorFn>;
    isConvert?:boolean;
    fileAccept?:string;
  };
  nestedProps?: IPropList[];  
}

export interface IFileUploadContainer {
  prop: string,
  fileData: fileUpload,
  response?: ApiResponseModel
}

export interface ILkpOptionArr  {
  id?: number;
  value: string;
  clientLookupCode?: string;
  mergeTagName?:string;
  orderNo?: number;
};
