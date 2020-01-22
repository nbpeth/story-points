import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DefaultPointSelection} from "../point-selection/point-selection";

@Component({
  selector: 'voting-booth',
  templateUrl: './voting-booth.component.html',
  styleUrls: ['./voting-booth.component.scss']
})
export class VotingBoothComponent implements OnInit {
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  pointSelection = new DefaultPointSelection();
  vote: any;

  constructor() { }

  ngOnInit() {
  }

  voteHasChanged = (value: any) => {
    this.vote = value;
  }

  submitVote = () => {
    this.voteSubmitted.emit(this.vote);
  }


}
