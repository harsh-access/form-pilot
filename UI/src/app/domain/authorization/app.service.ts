import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

import { ApplicationConfiguration, ApplicationPage } from "@rx/core/index";
import { RxHttp, RequestQueryParams, LookupAction } from '@rx/http/index';
import { Http } from "@angular/http";

@Injectable()
export class ApplicationService {
    private username: string;
    private api: string = 'api/applicationconfigurations'

    constructor(private baseHttp: Http,
        private http: RxHttp

    ) { }

    getConfiguration(languageName: string): Observable<any> {
        languageName = 'en';
        var cacheKey = ApplicationConfiguration.get("cachedKeys.applicationconfigurations");
        let uri = `json-data/configuration/configuration-settings.${languageName}.json?_=${cacheKey}`;
        return this.baseHttp.get(uri);
    }

    getLanguages(): Observable<any> {
        var cacheKey = ApplicationConfiguration.get("cachedKeys.languages");
        let uri = `api/masterlookups/languages/?_=${cacheKey}`;
        return this.http.get(uri);
    }

    getModuleContents(languageName: string, actionType: string, pageName: string): Observable<any> {
        var cacheKey = ApplicationConfiguration.get("cachedKeys.modulecontents");
        let uri = `json-data/pages/${pageName}/${pageName}-${actionType.toLowerCase()}.${languageName}.json?_=${cacheKey}`;
        return this.baseHttp.get(uri);
    }
    getApplicationConfiguration(): Observable<any> {
        let uri = 'json/application-configuration.json';
        return this.http.get(uri);
    }
    getCachedKeys(): Observable<any> {
        let uri = 'json/keys.json?_=' + Math.random();
        return this.http.get(uri);
    }
}
