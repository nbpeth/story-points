import {Pipe, PipeTransform} from '@angular/core';
import {Participant} from '../active-session/model/session.model';

@Pipe({
  name: 'username'
})

export class UsernamePipe implements PipeTransform {

  transform(value: Participant, ...args: any[]): any {
    return value.firstName ? `${value.firstName} ${value.lastName}` : value.participantName;
  }
}
