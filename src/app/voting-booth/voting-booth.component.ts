import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DefaultPointSelection, PointSelection} from '../point-selection/point-selection';

@Component({
  selector: 'voting-booth',
  templateUrl: './voting-booth.component.html',
  styleUrls: ['./voting-booth.component.scss']
})
export class VotingBoothComponent {
  @Input() votingScheme: string;
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  pointSelection: PointSelection = new DefaultPointSelection();
  vote: any;

  voteHasChanged = (value: any) => {
    this.vote = value;
  }

  submitVote = () => {
    this.voteSubmitted.emit(this.vote);
  }
}
