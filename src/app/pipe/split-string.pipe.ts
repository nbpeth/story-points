import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitString'
})
export class SplitStringPipe implements PipeTransform {
  transform(value: string, ...args: any[]): string[] {
    return value ? value.split(',') : [];
  }
}
