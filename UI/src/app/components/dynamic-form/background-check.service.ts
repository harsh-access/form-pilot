import { Injectable } from '@angular/core';
import { RequestQueryParams, RxHttp } from '@rx/http/index';
import { AuthorizeApi } from "@rx/security/index";
import { IBackgorundCheck, Questionnaire } from './Sidebars/backgroundcheck-sidebar/backgroundcheck-propertyList-functions';

@Injectable()
export class BackgroundCheckService {

  public checks: {
    applicationformChecks: IBackgorundCheck[]
    otherChecks: IBackgorundCheck[]
  }

  private get apiGetInviteApplicationFormChecks(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/UniversalBackgroundcheck/ApplicantInviteChecks`,
      applicationModuleId: 14,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get apiGetQuestionnairesForms(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/OBReferenceCheck/getQuestionnairesForms`,
      applicationModuleId: 14,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get apiAddApplicationFormChecks(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/AddApplicationFormChecks`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get apiUpdateApplicationFormChecks(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/UpdateApplicationFormChecks`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get apiDeleteApplicationFormChecks(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/DeleteApplicationFormChecks`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  private get apiReorderApplicationFormChecks(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AddForms/ReorderApplicationFormChecks`,
      applicationModuleId: 11,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  constructor(private http: RxHttp) { }

  public getInviteApplicationFormChecks(params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(this.apiGetInviteApplicationFormChecks, [...params, true], false).subscribe((response) => {
        this.checks = response;
        resolve(response);
      }, (err) => {
        reject(err);
      });
    })
  }

  public AddApplicationFormChecks(params?: any[] | { [key: string]: any; } | RequestQueryParams): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.http.post<any>(this.apiAddApplicationFormChecks, params).subscribe((response) => {
        resolve(response);
      }, (err) => {
        reject(err);
      });
    })
  }

  public UpdateApplicationFormChecks(params?: any[] | { [key: string]: any; } | RequestQueryParams): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.http.post<any>(this.apiUpdateApplicationFormChecks, params).subscribe((response) => {
        resolve(response);
      }, (err) => {
        reject(err);
      });
    })
  }

  public DeleteApplicationFormChecks(params?: any[] | { [key: string]: any; } | RequestQueryParams): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.http.post<any>(this.apiDeleteApplicationFormChecks, params).subscribe((response) => {
        resolve(response);
      }, (err) => {
        reject(err);
      });
    })
  }

  public ReorderApplicationFormChecks(params?: any[] | { [key: string]: any; } | RequestQueryParams): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.http.post<any>(this.apiReorderApplicationFormChecks, params).subscribe((response) => {
        resolve(response);
      }, (err) => {
        reject(err);
      });
    })
  }

  public getQuestionnairesForms(): Promise<Questionnaire[]> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(this.apiGetQuestionnairesForms).subscribe({
        next: (response) => resolve(response),
        error: (err) => reject(err)
      });
    });
  }

  public getCheckControlList(checkId: number = 0) {
    let checks = [...this.checks.applicationformChecks, ...this.checks.otherChecks]
    return checks.find(x => x.checkId === checkId);
  }
}
