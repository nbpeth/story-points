import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Subject } from "rxjs-compat";

@Component({
  selector: "voting-booth",
  templateUrl: "./voting-booth.component.html",
  styleUrls: ["./voting-booth.component.scss"],
})
export class VotingBoothComponent implements OnChanges {
  @Input() pointValues: string;
  @Input() pointSchemeHasChanged: Subject<any>;
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  pointOptions: string[];

  // pointSelection: PointSelection = new DefaultPointSelection();
  vote: any;

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.pointValues)
    if (Object.keys(changes).includes("pointValues")) {
      const change = changes["pointValues"];
      const currentValue = change && change.currentValue;

      this.pointOptions = currentValue && currentValue.split(",");
    }
  }

  voteHasChanged = (value: any) => {
    this.vote = value;
  };

  submitVote = () => {
    this.voteSubmitted.emit(this.vote);
  };
}
