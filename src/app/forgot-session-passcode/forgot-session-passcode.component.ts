import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {User, UserService} from '../user.service';
import {of} from 'rxjs';
import {flatMap, single} from 'rxjs/operators';

@Component({
  selector: 'forgot-session-passcode',
  templateUrl: './forgot-session-passcode.component.html',
  styleUrls: ['./forgot-session-passcode.component.scss']
})
export class ForgotSessionPasscodeComponent implements OnChanges {
  @Input() sessionId: string;
  isRoomAdmin: boolean;
  loading: boolean;

  newPassCode: string;
  verifyPassCode: string;
  passCodesAreEqual: boolean;

  constructor(private userService: UserService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loading = true;

    this.userService.getUserInfo()
      .pipe(
        single(),
        flatMap((user: User) => {
            const isAdmin = user.adminOfRooms ? user.adminOfRooms.includes(+this.sessionId) : false;

            return of(isAdmin);
          }
        )
      ).subscribe((result) => {
        this.isRoomAdmin = result;
        this.loading = false;
      }
    );
  }

  passCodeChanged = (_: Event) => {
    this.verifyPasscodesAreEqual();
  }

  verifyPassCodeChanged = (_: Event) => {
    this.verifyPasscodesAreEqual();
  }

  private verifyPasscodesAreEqual = () => {
    this.passCodesAreEqual = this.newPassCode && this.newPassCode === this.verifyPassCode;
  }
}
