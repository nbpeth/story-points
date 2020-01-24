import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DefaultPointSelection, FistOfFivePointSelection, PointSelection, PrimePointSelection} from '../point-selection/point-selection';
import {VotingScheme} from '../control-panel/control-panel.component';

@Component({
  selector: 'voting-booth',
  templateUrl: './voting-booth.component.html',
  styleUrls: ['./voting-booth.component.scss']
})
export class VotingBoothComponent implements OnInit, OnChanges {
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
      case VotingScheme.Fibbonaci as string:
        return new DefaultPointSelection();
      case VotingScheme.FistOfFive as string:
        return new FistOfFivePointSelection();
      case VotingScheme.Primes as string:
        return new PrimePointSelection();
    }
  };
}
