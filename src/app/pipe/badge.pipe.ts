import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'badge'
})
export class BadgePipe implements PipeTransform {
  private badgeMap = {
    UNKNOWN: {icon: '❓', display: `We're sure they got something for this`},
    NEW_SESSION: {icon: '🥇', display: 'Created a new session since badges were incepted.'},
    CELEBRATE_100: {icon: '🎇', display: 'Celebrated 100 times'},
    CELEBRATE_500: {icon: '🎏', display: 'Celebrated 500 times'},
    CELEBRATE_1000: {icon: '🍾', display: 'Celebrated 1000 times'},
  };

  transform(value: string[], ...args: any[]): any {
    return value && value.map(badgeKey => this.badgeMap[badgeKey] || this.badgeMap.UNKNOWN);
  }
}
