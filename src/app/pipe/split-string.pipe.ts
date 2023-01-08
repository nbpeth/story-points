import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'splitstring'
})
export class SplitStringPipe implements PipeTransform {
  transform(value: string, delimiter: string): any[] {
    return value ? value.split(delimiter) : [];
  }
}
