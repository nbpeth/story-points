import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {makePointSelection, PointSelection} from '../point-selection/point-selection';

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
    this.pointSelection = makePointSelection(changes.votingScheme.currentValue);
  }

  voteHasChanged = (value: any) => {
    this.vote = value;
  };

  submitVote = () => {
    this.voteSubmitted.emit(this.vote);
  };
}
