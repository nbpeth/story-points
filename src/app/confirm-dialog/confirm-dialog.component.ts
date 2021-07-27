import {Component, HostListener, Inject} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  id: string;
  passcodeEnabled: boolean;
  verifyPassCode: string;
  verifySessionName: string;
  sessionName: string;
  message: string;
  error: string;

  constructor(private passwordService: PasswordService, private dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: any) {
    this.id = data.id;
    this.passcodeEnabled = data.passcodeEnabled;
    this.sessionName = data.sessionName;
    this.message = data.message;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.okToDelete()) {
      this.close(true);
    }
  }

  close = (shouldClose: boolean) => {
    this.passwordService.authorizeSession(this.id, this.verifyPassCode).subscribe((_) => {
      this.dialogRef.close(shouldClose);
    }, error => {
      console.error(error);
      this.error = 'Invalid passcode';
    });
  }

  okToDelete = (): boolean =>
    this.verifySessionName === this.sessionName
}
