import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { SocketService } from "../../services/socket.service";
import {
  ParticipantRemovedSessionMessage,
  ParticipantRemovedSessionPayload,
} from "../model/events.model";
import { Participant } from "../model/session.model";
import { UserService } from "../../user.service";
import { BehaviorSubject } from "rxjs-compat";

@Component({
  selector: "user-tile",
  templateUrl: "./user-tile.component.html",
  styleUrls: ["./user-tile.component.scss"],
})
export class UserTileComponent implements OnInit, OnChanges {
  @Input() sessionId: any;
  @Input() participant: Participant = new Participant();
  @Input() pointsVisible: boolean;
  @Input() firstReveal: boolean;
  @Input() myCard: boolean;
  @Input() isDarkTheme: boolean;
  @Input() locked: boolean;

  @Input() synergizing: BehaviorSubject<boolean>;
  synergizeEvent: boolean;
  @Input() thoseWhoHaveNotVoted: string[];
  // isShamed = new BehaviorSubject();

  constructor(
    private socketService: SocketService,
    public userService: UserService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("changes", changes)
    // if (!!Object.keys(changes).includes("thoseWhoHaveNotVoted")) {
    //   this.isShamed = Boolean(this.thoseWhoHaveNotVoted.find(shamedLoginId => this.participant.loginId === shamedLoginId));
    // }
  }

  ngOnInit(): void {
    this.synergizing.subscribe((x) => {
      if (this.synergizeEvent !== x) {
        this.synergizeEvent = x;
      }
    });
    // this.userService.sh
  }

  removeUser = () => {
    const message = new ParticipantRemovedSessionMessage(
      new ParticipantRemovedSessionPayload(
        this.participant.participantId,
        this.participant.participantName,
        this.sessionId,
        this.participant.loginId,
        this.participant.loginEmail
      )
    );
    this.socketService.send(message);
  };
}
