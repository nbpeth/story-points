import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'parseDatePipe'
})
export class ParseDatePipe implements PipeTransform {
  transform(value: string, ...args: any[]): any {
    return Date.parse(value);
  }
}
