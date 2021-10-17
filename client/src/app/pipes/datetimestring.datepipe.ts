import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateTimeString'
})
export class DateTimeStringPipe extends
  DatePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        console.log(value.getHours());
    return super.transform(value, "EEEE") + " " + this.getTimeString(value.getHours());
  }

  private getTimeString(hour: number): string {
    if (0 <= hour && hour < 12) {
        return "morning";
    } else if (12 <= hour && hour < 18) {
        return "afternoon";
    } else {
        return "evening";
    }
  }
}