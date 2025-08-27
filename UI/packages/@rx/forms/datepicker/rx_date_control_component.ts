import { DOCUMENT } from "@angular/common";
import {
    Component, ComponentFactoryResolver, ElementRef, EventEmitter, forwardRef, HostListener, Inject, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren, ViewContainerRef
} from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { ApplicationConfiguration } from '../../core';
import { OffSetModel, OverlayPositionHost, OverlayViewHost } from "../../core/view/overlay_view_host";
import { ComponentView } from "../../core/view/view";
import { Multilingual } from "../multilingual";
import { DateDisabled } from './datepicker.models';
import { RxPickerComponent } from './rx_picker_control_component';
declare const $: any;






@Component({
    selector: "rx-date",
    template: `<div class="input-group w-100"><input type="text" #inputDate [disabled]="pickerDisabled" [placeholder]="placeholder" [class]="pickerClass"
    (blur)="onBlur($event,$event.target)" (keyup)="onKeyup($event)" [(ngModel)]="selectedDate" (input)="checkinput($event)">
    <span class="input-group-addon" (click)="prependClick($event)">
    <span class="fa fa-calendar"s *ngIf="!showAddon"></span>
    <div *ngIf="showAddon" class="input-group-prepend">
        <span class="input-group-text"><span class="fa fa-calendar" ></span></span>
    </div>
    </span>
    </div>`,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RxDateComponent), multi: true },
        //{ provide: NG_VALIDATORS, useExisting: forwardRef(() => RxDateComponent), multi: true }
    ],

    entryComponents: [RxPickerComponent]
})
export class RxDateComponent extends Multilingual implements OnDestroy, OnInit {
    @ViewChildren('inputDate') inputDate: QueryList<ElementRef>;
    element: Element;
    isInValid: boolean = false;
    seperator: string;
    format: string;
    month: number;
    year: number;
    selectedDate: string;
    isValidationSuccess: boolean = true;
    private propagateChange: any = () => { };
    value: Date;
    timeOutId: number;
    dateFormatPattern: RegExp = /^(\d*)(\.|-|\/)(\d*)(\.|-|\/)(\d*)$/
    validateFn: any = () => { };
    overlayElement: HTMLElement;
    isMouseLeave: boolean = true;
    hoverSubscriber: Subscription;
    selectDateSubscription: Subscription;
    conditionalSubscription: Subscription;
    overlayViewHost: OverlayViewHost;
    overlayPositionHost: OverlayPositionHost;
    isPrependClick: boolean = false;
    public count = 1;
    componentView: ComponentView<RxPickerComponent>;
    @Input() hideOnClick?: boolean = false;
    @Output() onSelected: EventEmitter<Date> = new EventEmitter<Date>();

    constructor(public elementRef: ElementRef,
        public viewContainerRef: ViewContainerRef,
        public componentFactoryResolver: ComponentFactoryResolver,
        @Inject(DOCUMENT) private document: any
    ) {
        super();
        this.format = ApplicationConfiguration.get("internationalization.date.format");
        this.seperator = ApplicationConfiguration.get("internationalization.date.seperator");
        this.overlayViewHost = new OverlayViewHost(document);
        this.overlayPositionHost = new OverlayPositionHost();
        this.element = elementRef.nativeElement as Element;
    }


    @Input() weekStart: number = 0;
    @Input() viewMode: string = "Date";
    @Input() disableWeekDays: number[];
    @Input() highlightWeekDays: number[];
    @Input() datesDisabled: DateDisabled[];
    @Input() pickerClass: string;
    @Input() conditional: Observable<boolean>;
    @Input() pickerDisabled: boolean;
    @Input() showAddon: boolean;
    @Input() beforeAddValidation: Function;


    private registerOnChange(fn) {
        this.propagateChange = fn;
        if (this.value) {
            this.propagateChange(this.utcDate(this.value.getFullYear(), this.value.getMonth(), this.value.getDate()));
        }

    }

    checkinput(event) {
        if (event.target.value.split('/')[2].length > 4) {
            event.target.value = event.target.value.slice(0, -1);
        }
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseClick(event) {
        if ($(event.target)[0].className != 'fa fa-calendar' && $(event.target)[0].className != 'input-group-addon') {
            this.count = 1;
            if ($(event.target).closest('.datepicker-dropdown').length == 0) {
                this.removePicker();
            }
        }
    }

    ngOnInit(): void {
        this.element.classList.add("custom-control-style");
        this.checkValid(true);
        if (this.conditional)
            this.conditionalSubscription = this.conditional.subscribe(t => this.checkValid(t));
    }

    checkValid(isValid: boolean) {
        if (isValid)
            this.timeOutId = window.setTimeout(() => {
                for (var i = 0; i < this.element.classList.length; i++) {
                    this.isInValid = this.element.classList[i] == "ng-invalid";
                }
                window.clearTimeout(this.timeOutId);
                this.timeOutId = undefined;
            }, 500);
        else
            this.isInValid = isValid;
    }

    checkBeforeAddValidation(value: Date) {
        var result = true;
        if (this.beforeAddValidation)
            result = this.beforeAddValidation(value);
        return result;
    }


    private registerOnTouched() { }


    private writeValue(value: any) {
        if (value) {
            if (typeof value === 'string') {
                value = new Date(<string>value);
            }
            this.value = value;
            this.selectedDate = this.makeDateString(value);
        } else {
            this.selectedDate = value;
        }
        this.onSelected.emit(this.value)
    }

    utcDate(year: number, month: number, days: number): Date {
        return new Date(Date.UTC.apply(Date, [year, month, days]));
    }

    makeDateString(value: Date): string {
        let dateString: string = '';
        for (let character of this.format) {
            switch (character) {
                case 'm':
                    dateString += dateString.length == 0 ? (value.getMonth() + 1).toString() : this.seperator + (value.getMonth() + 1)
                    break;
                case 'd':
                    dateString += dateString.length == 0 ? (value.getDate()).toString() : this.seperator + (value.getDate())
                    break;
                case 'y':
                    dateString += dateString.length == 0 ? (value.getFullYear()).toString() : this.seperator + (value.getFullYear())
                    break;
            }
        }
        return dateString;
    }

    isValidDate(value: string): Date {
        let date: Date;
        let dateNumber: number;
        if (this.dateFormatPattern.test(value)) {
            var splitValue = value.split(this.seperator);
            let dateString: string = '';
            if (splitValue.length == 3) {
                for (let character of 'mdy') {
                    var index = this.format.indexOf(character);
                    dateString += dateString.length == 0 ? splitValue[index].toString() : "/" + splitValue[index].toString();
                    if (character == "d")
                        dateNumber = parseInt(splitValue[index]);
                    if (character === 'y') {
                        if (parseInt(splitValue[index]) > 1699 && parseInt(splitValue[index]) < 3001) {
                            date = new Date(dateString);
                        }
                    }
                }
            }
        }
        this.isMouseLeave = true;
        if (date && dateNumber == date.getDate())
            return date;
        return undefined;
    }
    validate(formControl: FormControl) {
        return (this.isValidationSuccess) ? null : { dateError: 'Invalid Date' };
    }

    changeViewMode(mode: string, currentMonth?: number, currentYear?: number) {
        if (currentMonth) {
            this.month = currentMonth;
            this.year = currentYear;
        }
        this.viewMode = mode;
    }

    onFocus(event: Event): void {
        if (!this.pickerDisabled)
            if (!this.componentView) {
                this.createPicker();
                this.isPrependClick = true;
            }
    }



    prependClick(event: any): void {
        if (this.count % 2 == 1) {
            if (!this.pickerDisabled) {
                if (!this.componentView && !this.isPrependClick) {
                    this.inputDate.first.nativeElement.focus();
                    this.onFocus(event);
                } else {
                    this.isPrependClick = false;
                }
            }
        }
        this.count++
    }
    onKeyup($event): any {
        this.removePicker();
        $event.target.value = $event.target.value
            .replace(/^(\d\d)(\d)$/g, "$1/$2")
            .replace(/^(\d\d\/\d\d)(\d+)$/g, "$1/$2")
            .replace(/[^\d\/]/g, "");
        this.valueChange($event.target.value);
    }
    valueChange(value: string): void {
        if (value) {
            let date = this.isValidDate(value);
            this.isValidationSuccess = date && date.toString() !== "Invalid Date"
            if (this.isValidationSuccess) {
                this.isInValid = false;
                date = this.utcDate(date.getFullYear(), date.getMonth(), date.getDate());
                if (this.checkBeforeAddValidation(date)) {
                    this.propagateChange(date);
                    this.value = date;
                } else
                    this.propagateChange(undefined)
            }
            else
                this.isInValid = true, this.propagateChange(undefined);
        } else
            this.propagateChange(undefined), window.setTimeout(() => this.checkValid(true), 200);
    }

    onBlur(event: Event, element: HTMLInputElement): void {
        if (this.isMouseLeave)
            this.removePicker();
        this.isPrependClick = false;
        let date = this.isValidDate(element.value);
        this.isValidationSuccess = date && date.toString() !== "Invalid Date"
        if (!this.isValidationSuccess)
            element.value = '';
    }

    private createPicker() {
        this.setOverlay();
        if (this.timeOutId)
            window.clearTimeout(this.timeOutId);
        this.timeOutId = window.setTimeout(() => {
            this.showPicker();
        }, 2)

    }

    private setOverlay() {
        var pickerElement = this.createPickerComponent();
        this.overlayViewHost.createElement(["datepicker", "datepicker-dropdown", "dropdown-menu", "datepicker-orient-left", "datepicker-orient-bottom"]);
        this.overlayViewHost.appendChild(pickerElement);
    }

    private removePicker() {
        if (this.componentView) {
            this.componentView.destroy();
            this.overlayViewHost.destroy();
            this.componentView = undefined;
        }
    }

    private showPicker() {
        let offSetModel = new OffSetModel("bottom",
            this.overlayPositionHost.getClientRectangle(this.elementRef.nativeElement),
            this.overlayPositionHost.getOffset(this.elementRef.nativeElement),
            this.overlayPositionHost.getOffset(this.overlayViewHost.element), false);
        var calculatedOffset = this.overlayPositionHost.getCalculatedOffset(offSetModel);
        this.overlayViewHost.applyPlacement(calculatedOffset);
        this.overlayViewHost.setStyle({ 'display': 'block', 'z-index': 9999 });
    }

    private createPickerComponent(): HTMLElement {
        this.componentView = new ComponentView<RxPickerComponent>(RxPickerComponent, this.viewContainerRef, this.componentFactoryResolver);
        this.componentView.create({
            'value': this.value,
            'weekStart': this.weekStart,
            'viewMode': this.viewMode,
            'disableWeekDays': this.disableWeekDays,
            'highlightWeekDays': this.highlightWeekDays,
            'datesDisabled': this.datesDisabled,
        });
        let componentRef = this.componentView.getComponentRef();
        //this.selectDateSubscription = componentRef.instance.selectDate.subscribe(t => this.setValue(t));
        this.selectDateSubscription = componentRef.instance.selectDate.subscribe(t => {
            this.setValue(t);
            if (this.hideOnClick)
                this.removePicker();
            //this.onSelected.emit(this.value)
        });
        this.hoverSubscriber = componentRef.instance.hoverEvent.subscribe(t => this.onHover(t));
        return this.componentView.rootNode();
    }

    setValue(value: Date) {
        if (this.checkBeforeAddValidation(value)) {
            this.isInValid = false;
            this.propagateChange(value);
            this.writeValue(value);

        } else {
            this.propagateChange(undefined);
        }
        if (this.inputDate)
            this.inputDate.first.nativeElement.focus();
    }

    onHover(value: boolean): void {
        this.isMouseLeave = value;
        // if (this.isMouseLeave)
        //     this.removePicker();
    }

    ngOnDestroy(): void {
        this.removePicker();
        if (this.selectDateSubscription) {
            this.selectDateSubscription.unsubscribe();
            this.hoverSubscriber.unsubscribe();
        }
        if (this.conditionalSubscription)
            this.conditionalSubscription.unsubscribe();
    }
}
