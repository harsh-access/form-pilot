import { Injectable } from '@angular/core';
import { RequestQueryParams, RxHttp } from '@rx/http/index';
import { AuthorizeApi } from "@rx/security/index";
import { Observable, of } from 'rxjs';
import { DynamicForm } from 'src/app/view-modal/DynamicFormModel';
import { SaveChangesModel } from 'src/app/view-modal/EditFormModels';
import { ApiResponseModel, fileUpload, lookupObj, testApplicantModel } from 'src/app/view-modal/GeneralApiModel';
import { vOfficesLookUp } from 'src/app/view-modal/LookupModels';

@Injectable()
export class DynamicFormService {

  private get getOfficeLookupAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/onboardlookups/officesLookUps`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get getFormAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/GetFormForView`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get getEditableFormIdAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/GetEditableFormId`,
      applicationModuleId: 11,
    }
    return authorizeApi;
  }

  private get verifyFormForEditAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/GetVerificationForEdit`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postSaveFileAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/saveUploadedFile`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postDownloadUploadedFileAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/DownloadUploadedFile`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postLookupChangeAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/saveLookupUpdates`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postStageChangesAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/SaveStageUpdates`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postSectionChangesAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/SaveSectionUpdates`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postSaveFormAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/SaveEditedForm`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postSaveFieldsetChangesAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/SaveFieldset`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postTestApplicantAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/AddApplicant`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  //1767-1858/31-01-2025/new api for test reference formtype forms
  private get postTestRefereeAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/AddReferee`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }
  private get getDiscardFormAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/DiscardForm`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get getPublishFormAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/PublishForm`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }
  //2039/26022025/Discard Referee Form API
  private get getDiscardRefereeFormAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/DiscardRefereeForm`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }
  //2039/26022025/Publish Referee Form API
  private get getPublishRefereeFormAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/PublishRefereeForm`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }
  private get getAtsMappingsAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AtsMappingDetails/getAtsMapping`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get getAtsDetailsAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AtsDetailsForExcel`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get postDependencyUpdatesAPI(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/saveDependencyUpdates`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get CreateBackgroundCheckStage(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/CreateBackgroundCheckStage`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  constructor(private http: RxHttp) { }

  getOfficeLookup(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<Array<vOfficesLookUp>> {
    return this.http.get<Array<vOfficesLookUp>>(this.getOfficeLookupAPI);
  }

  // getForm(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<DynamicForm> {
  //   return this.http.get<DynamicForm>(this.getFormAPI, params);
  // }
  getForm(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<DynamicForm> {
    const mockForm: DynamicForm = {
      id: 1,
      title: 'Employee Onboarding Form',
      sections: [
        {
          id: 1,
          orderNo: 1,
          title: 'Personal Information',
          subSections: [
            {
              id: 1,
              orderNo: 1,
              title: 'Basic Details',
              formFields: [
                { id: 1, type: 11, label: 'Full Name', placeholder: 'Enter your full name', required: true, options: [], columnIndex: 1, tabIndex: 1 },
                { id: 2, type: 12, label: 'Date of Birth', placeholder: '', required: true, options: [], columnIndex: 1, tabIndex: 2 }
              ]
            },
            {
              id: 2,
              orderNo: 2,
              title: 'Emergency Contact Details',
              formFields: [
                { id: 1, type: 11, label: 'Emergency Contact Name', placeholder: 'Emergency Contact Name', required: true, options: [], columnIndex: 1, tabIndex: 1 },
                { id: 2, type: 12, label: 'Emergency Contact Number', placeholder: 'Emergency Contact Number', required: true, options: [], columnIndex: 1, tabIndex: 2 }
              ]
            }
          ]
        },
        {
          id: 2,
          orderNo: 2,
          title: 'Job Information',
          subSections: [
            {
              id: 2,
              orderNo: 1,
              title: 'Employment Details',
              formFields: [
                { id: 3, type: 18, label: 'Department', placeholder: '', required: true, options: ['HR', 'IT', 'Finance'], columnIndex: 1, tabIndex: 3 }
              ]
            }
          ]
        }
      ]
    };

    return of(mockForm);
  }

  getEditableFormId(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<ApiResponseModel> {
    return this.http.get<any>(this.getEditableFormIdAPI, params);
  }

  postSaveForm(form: SaveChangesModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.postSaveFormAPI, form);
  }

  postSectionChanges(data: SaveChangesModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.postSectionChangesAPI, data);
  }

  postStageChanges(data: SaveChangesModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.postStageChangesAPI, data);
  }

  postSaveFieldsetChanges(data: SaveChangesModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.postSaveFieldsetChangesAPI, data);
  }

  /** Test Applicant */
  postTestApplicant(applicant: testApplicantModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.postTestApplicantAPI, applicant);
  }

  /** Test Referee *///1767-1858/31-01-2025/new api for test reference formtype forms
  postTestReferee(applicant: testApplicantModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.postTestRefereeAPI, applicant);
  }
  /** Discard Form Changes */
  getDiscardForm(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<ApiResponseModel> {
    return this.http.get<ApiResponseModel>(this.getDiscardFormAPI, params);
  }

  /** Publish Form Changes */
  getPublishForm(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<ApiResponseModel> {
    return this.http.get<ApiResponseModel>(this.getPublishFormAPI, params);
  }
  /** Discard Referee Form Changes */
  getDiscardRefereeForm(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<ApiResponseModel> {
    return this.http.get<ApiResponseModel>(this.getDiscardRefereeFormAPI, params);
  }

  /** Publish Referee Form Changes */
  getPublishRefereeForm(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<ApiResponseModel> {
    return this.http.get<ApiResponseModel>(this.getPublishRefereeFormAPI, params);
  }

  /** Return a promise not observable */
  postSaveLookupChanges(lookupData: lookupObj): Promise<ApiResponseModel> {
    return new Promise((resolve, reject) => {
      this.http.post<ApiResponseModel>(this.postLookupChangeAPI, lookupData).subscribe((t) => {
        resolve(t)
      },
        (err) => {
          let e: ApiResponseModel = { isSuccess: false, message: "something went wrong" }
          reject(e)
        })
    });
  }

  postSaveUploadedFile(fileUpload: fileUpload): Promise<ApiResponseModel> {
    return new Promise((resolve, reject) => {
      this.http.post<ApiResponseModel>(this.postSaveFileAPI, fileUpload).subscribe((t) => {
        resolve(t)
      },
        (err) => {
          let e: ApiResponseModel = { isSuccess: false, message: "something went wrong" }
          reject(e)
        })
    });
  }

  postDownloadUploadedFile(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.postDownloadUploadedFileAPI, params);
  }

  createBackgroundCheckStage(params?: any[] | { [key: string]: any; } | RequestQueryParams): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(this.CreateBackgroundCheckStage, params);
  }

  // Dependency Change
  postSaveDependencyUpdates(form: SaveChangesModel): Promise<ApiResponseModel> {
    return new Promise((resolve, reject) => {
      this.http.post<ApiResponseModel>(this.postDependencyUpdatesAPI, form, true).subscribe((t) => {
        resolve(t)
      },
        (err) => {
          let e: ApiResponseModel = { isSuccess: false, message: "something went wrong" }
          reject(e)
        })
    });
  }
}
