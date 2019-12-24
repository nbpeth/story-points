import { Pipe, PipeTransform } from '@angular/core';
import { Participant } from '../active-session/model/session.model';

@Pipe({
  name: 'participantFilter'
})
export class ParticipantFilterPipe implements PipeTransform {

  transform(value: Participant[], ...args: any[]): any {
    return value.filter((participant: Participant) => !participant.isAdmin);
  }

}
