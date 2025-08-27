export interface ApiResponseModel {
  isSuccess: boolean
  message: string
}

export interface fileUpload {
  formFieldId:number
  fileName:string
  base64Data : string
  isConvert?: boolean
}

export interface lookupObj {
  applicationFormId: number
  formFieldId?: number
  lookupViewId?: number
  lookups: Array<{ id?:number, value:string, clientLookupCode:string }>
}


/** Applicant Model */
export interface testApplicantModel {
  applicationFormId: number;
  officId: number;
  firstName : string;
  lastName : string;
  email : string;
  mobile : string;
}

