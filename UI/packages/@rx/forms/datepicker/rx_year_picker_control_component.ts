import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    SimpleChanges
} from "@angular/core";
import { RxPickerComponent } from './rx_picker_control_component';
@Component({
    selector: "rx-year-picker",
    templateUrl: './rx_year_picker_control_component.html',
    //styleUrls: ['./datepicker.css']
})
export class RxYearPicker implements OnChanges {

    isLabelYear: boolean = true;
    yearLabel: string = '';
    yearCollection: number[];
    numberOfYearToShow: number = 12;
    @Input() year: number;
    @Output() yearClick: EventEmitter<number> = new EventEmitter<number>();

    constructor(public dateComponent: RxPickerComponent) {        
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['year']) {
            this.year = changes['year'].currentValue;
            if (this.year)
                this.generateYears(this.year)
        }
    }
    ngOnInit(): void {

    }

    generateYears(year) {
        this.yearCollection = [];
        while (this.yearCollection.length != this.numberOfYearToShow) {
            this.yearCollection.push(year++)
        }
        this.yearLabel = `${this.yearCollection.first()} - ${this.yearCollection.last()}`
    }

    showMonth(year: number): void {

        this.yearClick.emit(year);
        this.dateComponent.changeViewMode("Month");
    }

    nextYear() {
        var year = this.yearCollection[this.numberOfYearToShow - 1];
        year = year + 1
        this.generateYears(year)
    }

    previousYear() {
        var year = this.yearCollection[0];
        year = year - this.numberOfYearToShow
        this.generateYears(year)
    }


}
