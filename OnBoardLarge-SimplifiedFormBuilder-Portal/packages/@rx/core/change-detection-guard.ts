import { ActivatedRouteSnapshot } from "@angular/router";
import { Observable } from "rxjs";

export interface ChangeDetectionGuard {
    canDeactivate: (component: any,
        route: ActivatedRouteSnapshot
    ) => boolean | Observable<boolean> | Promise<boolean>;
}
