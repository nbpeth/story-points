import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  PointSchemaChangedMessage,
  PointSchemaChangedPayload
} from "../active-session/model/events.model";
import { SocketService } from "../services/socket.service";

@Component({
  selector: "app-change-point-scheme",
  templateUrl: "./change-point-scheme.component.html",
  styleUrls: ["./change-point-scheme.component.scss"],
})
export class ChangePointSchemeComponent {
  sessionId: any;
  pointSchemeOptions: any[];

  constructor(
    public socketService: SocketService,
    private dialogRef: MatDialogRef<ChangePointSchemeComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.pointSchemeOptions = data.pointSchemeOptions;
    this.sessionId = data.sessionId;
  }

  close = () => {
    this.dialogRef.close();
  };

  submit = (event) => {
    this.close();
  };

  pointSchemeHasChanged(selection: any) {
    this.socketService.send(
      new PointSchemaChangedMessage(
        new PointSchemaChangedPayload(this.sessionId, selection.value.id)
      )
    );
  }
}
