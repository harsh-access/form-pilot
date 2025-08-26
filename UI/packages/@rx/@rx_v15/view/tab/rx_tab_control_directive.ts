import { OnDestroy, ElementRef, Renderer2, HostListener, Input, Directive } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Subject } from "rxjs";

import { TabModel } from "./tab.models"

@Directive({
    selector: "[rxTab]"
})
export class RxTabDirective implements OnDestroy {
    tab: TabModel;
    private subjectTabSelected: Subject<RxTabDirective>;
    tabSelected: Observable<RxTabDirective>;
    constructor(public elementRef: ElementRef, public renderer: Renderer2) {
        this.subjectTabSelected = new Subject<RxTabDirective>();
        this.tabSelected = this.subjectTabSelected.asObservable();
    }

    @Input('rxTab') set setTab(value: TabModel) {
        this.tab = value;
        if (this.tab.active)
            this.setActiveClass(true);
    }

    // this needs to be conditionaly...
    @HostListener('click', ['$event']) onClick(e) {
        this.tab.active = true;
        if (this.tab.autoSelection) {
            this.clickListener();
            this.setActiveClass(true);
        }
    }

    clickListener() {
        this.subjectTabSelected.next(this);
    }
    setActiveClass(value: boolean) {
        this.renderer.addClass(this.elementRef.nativeElement, 'active');
    }

    ngOnDestroy(): void {
        if (this.subjectTabSelected)
            this.subjectTabSelected.unsubscribe();
        this.subjectTabSelected = undefined;
        this.tabSelected = undefined;
    }
}