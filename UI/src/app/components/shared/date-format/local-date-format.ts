import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'localdatetime' })
export class LocalDateFormat implements PipeTransform {
    // adding a default format in case you don't want to pass the format
    transform(utcDateStr: any): Date {
        if (utcDateStr) {
            if (utcDateStr.indexOf("Z") == -1) {
                return new Date(utcDateStr + "Z");
            }
            else {
                return new Date(utcDateStr);
            }
        }
    }
}
