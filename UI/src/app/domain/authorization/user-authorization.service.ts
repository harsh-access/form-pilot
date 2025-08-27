import { Injectable, Inject, ReflectiveInjector } from "@angular/core";
import { Observable } from 'rxjs';
import { RxStorage } from "@rx/storage/index"
import { Http, RequestOptions, Headers } from "@angular/http";
import { API_HOST_URI, RequestHeaders, ResponseResult } from "@rx/http/index";
import { UserAuthorizationViewModel } from './user-authorization.models';
import { user } from '@rx/security/index'

@Injectable()
export class UserAuthorizationService {
    private api: string = 'api/userauthorization'
    storage: RxStorage;
    constructor(private http: Http,
        @Inject(API_HOST_URI) private hostUri: string,
        @Inject('RequestHeaders') private requestHeaders: RequestHeaders,
        @Inject('ResponseResult') private responseResult: ResponseResult,
        private requestOptions: RequestOptions) {
        let injector: any = ReflectiveInjector.resolveAndCreate([RxStorage]);
        this.storage = injector.get(RxStorage);
    }

    postAuthorize(data: any): Observable<any> {
        var auth = this.storage.local.get('auth');
        return this.http.post(
            this.hostUri.concat(this.api, '/', 'authorize'),
            JSON.stringify(data),
            new RequestOptions({ headers: new Headers({ "Content-Type": "application/json", "Authorization": auth }) }));
    }

    postLogOut(): Observable<any> {
        var auth = this.storage.local.get('auth');
        return this.http.post(this.hostUri.concat(this.api, '/', 'logout'), JSON.stringify({ userId: 3 }), // kept static userId as of now as per given by ajay sir.
            new RequestOptions({ headers: new Headers({ "Content-Type": "application/json", "Authorization": auth }) }));
    }

    postRemember(data: any): Observable<any> {
        return this.http.post(
            this.hostUri.concat(this.api, '/', 'rememberMe'),
            JSON.stringify(data),
            new RequestOptions({ headers: new Headers({ "Content-Type": "application/json" }) }));
    }

    checkLock(data: any): Observable<any> {
        let auth = this.storage.local.get('auth');
        return this.http.post(
            this.hostUri.concat('api/recordlocks'),
            JSON.stringify(data),
            new RequestOptions({ headers: new Headers({ "Content-Type": "application/json", "Authorization": auth }) }));
    }

    unLockRecord(data: any): Observable<any> {
        let auth = this.storage.local.get('auth');
        return this.http.delete(
            this.hostUri.concat(`api/recordlocks${data.applicationModuleId}/${data.mainRecordId}/${data.childModuleName}`),
            new RequestOptions({ headers: new Headers({ "Content-Type": "application/json", "Authorization": auth }) }));
    }

}
