import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'badge'
})
export class BadgePipe implements PipeTransform {
  private badgeMap = {
    UNKNOWN: {icon: '❓', display: `We're sure they got something for this`},
    NEW_SESSION: {icon: '🥇', display: 'Created a new session since badges were incepted.'}
  };

  transform(value: string[], ...args: any[]): any {
    return value && value.map(badgeKey => this.badgeMap[badgeKey] || this.badgeMap.UNKNOWN);
  }
}
