


import { Component, EventEmitter, Input, Output } from '@angular/core';
import { monthsShort } from './datepicker.const';
import { RxPickerComponent } from './rx_picker_control_component';
@Component({
    selector: "rx-month-picker",
    templateUrl: './rx_month_picker_control_component.html',
    //styleUrls: ['./datepicker.css']
})
export class RxMonthPicker {
    monthsShort: string[];
    isLabelYear: boolean = true;

    @Input() month: number;
    @Input() year: number;
    @Output() monthClick: EventEmitter<Date> = new EventEmitter<Date>();

    constructor(public dateComponent: RxPickerComponent) {
        this.monthsShort = monthsShort;
    }

    showDates(month: number): void {
        this.dateComponent.changeViewMode("Date");
        var date = this.utcDate(this.year, month, 28);
        this.monthClick.emit(date);
    }

    nextYear() {
        this.year = this.year + 1;
    }

    previousYear() {
        this.year = this.year - 1;
    }

    showYear() {
        this.dateComponent.changeViewMode("Year");
    }

    show(year: number) {
        this.year = year;
    }

    utcDate(year: number, month: number, days: number): Date {
        return new Date(Date.UTC.apply(Date, [year, month, days]));
    }
}
