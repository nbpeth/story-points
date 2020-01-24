import {Injectable} from '@angular/core';
import {LocalStorageService} from './local-storage.service';
import {ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VotingSchemeService {
  private votingScheme = new ReplaySubject<string>(1);
  votingSchemeValue = this.votingScheme.asObservable();

  constructor(private localStorage: LocalStorageService) {
  }

  setVoteScheme = (sessionId: number, votingScheme: string) => {
    this.votingScheme.next(votingScheme);
    this.localStorage.setVotingScheme(sessionId, votingScheme);
  };

  loadState = (sessionId: number): string => {
    const votingScheme = this.localStorage.getVotingScheme(sessionId);
    this.setVoteScheme(sessionId, votingScheme);
    return votingScheme;
  };

}
