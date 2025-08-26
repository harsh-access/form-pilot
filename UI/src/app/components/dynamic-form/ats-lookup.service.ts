import { Injectable } from '@angular/core';
import { RxHttp } from '@rx/http/index';
import { AuthorizeApi } from "@rx/security/index";
import { Observable } from 'rxjs';

@Injectable()
export class AtsLookupService {

  private get apiGetVincereCustomFieldLookups(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AtsLookup/VincereCustomFieldLookups`,
      applicationModuleId: 14,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }


  private get apiGetVincereCandidateCoreFieldLookups(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AtsLookup/VincereCandidateCoreFieldLookups`,
      applicationModuleId: 14,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }


  private get apiGetBullhornCustomFieldLookups(): AuthorizeApi {
    var authorizeApi: AuthorizeApi = {
      api: `api/AtsLookup/BullhornCustomFieldLookups`,
      applicationModuleId: 14,
      keyName: 'applicationFormId'
    }
    return authorizeApi;
  }

  constructor(private http: RxHttp) { }

  public getVincereCustomFieldLookups(key: string): Observable<any>{
    let apiCall = this.apiGetVincereCustomFieldLookups;
    apiCall.api = apiCall.api + `/${key}`;
    return this.http.get<any>(apiCall);
  }

  public getVincereCandidateCoreFieldLookups(key: string): Observable<any>{
    let apiCall = this.apiGetVincereCandidateCoreFieldLookups;
    apiCall.api = apiCall.api + `/${key}`;
    return this.http.get<any>(apiCall);
  }

  public getBullhornCustomFieldLookups(url: string): Observable<any> {
    const apiCall = this.apiGetBullhornCustomFieldLookups;
    // apiCall.api = `${this.apiGetBullhornCustomFieldLookups.api}?Url=${encodeURIComponent(url)}`;
    const body = { url };
    return this.http.post<any>(apiCall,body);
  }
}
