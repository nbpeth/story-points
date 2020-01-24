import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DefaultPointSelection, FistOfFivePointSelection, PointSelection, PrimePointSelection} from '../point-selection/point-selection';
import {VotingScheme} from './voting.model';
import {VotingSchemeService} from '../services/voting-scheme.service';

@Component({
  selector: 'voting-booth',
  templateUrl: './voting-booth.component.html',
  styleUrls: ['./voting-booth.component.scss']
})
export class VotingBoothComponent implements OnInit, OnChanges {
  @Input() sessionId: number;
  @Input() votingScheme: string;
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  pointSelection: PointSelection;
  vote: any;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pointSelection = this.makePointSelection(changes.votingScheme.currentValue);
  }

  voteHasChanged = (value: any) => {
    this.vote = value;
  };

  submitVote = () => {
    this.voteSubmitted.emit(this.vote);
  };


  makePointSelection = (votingScheme: string): PointSelection => {
    switch (votingScheme) {
      case VotingScheme.Fibbonaci.toString():
        return new DefaultPointSelection();
        break;
      case VotingScheme.FistOfFive.toString():
        return new FistOfFivePointSelection();
        break;
      case VotingScheme.Primes.toString():
        return new PrimePointSelection();
        break;
    }
  };
}
