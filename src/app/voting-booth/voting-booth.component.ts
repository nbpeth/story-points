import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DefaultPointSelection, FistOfFivePointSelection, PointSelection} from '../point-selection/point-selection';
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
    switch (changes.votingScheme.currentValue) {
      case VotingScheme.Fibbonaci.toString():
        this.pointSelection = new DefaultPointSelection();
        break;
      case VotingScheme.FistOfFive.toString():
        this.pointSelection = new FistOfFivePointSelection();
        break;
    }
  }

  voteHasChanged = (value: any) => {
    this.vote = value;
  };

  submitVote = () => {
    this.voteSubmitted.emit(this.vote);
  };
}
