import {Component, HostListener} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NameBuilder} from '../name-builder';
import {PasswordService} from '../services/password.service';

@Component({
  selector: 'app-create-session-dialog',
  templateUrl: './create-session-dialog.component.html',
  styleUrls: ['./create-session-dialog.component.scss']
})
export class CreateSessionDialogComponent {
  public createWithPasscode = true;
  public passCode: string;
  public verifyPassCode: string;
  public passCodesAreEqual: boolean;
  sessionName: string;


  constructor(private dialogRef: MatDialogRef<CreateSessionDialogComponent>) {
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (event.key === 'Enter' && this.formValid()) {
      this.create();
    }
  }

  create = () => {
    const newSessionName = this.sessionName ? this.sessionName : NameBuilder.generate();
    const passCode = this.createWithPasscode ? PasswordService.encode(this.passCode) : undefined;

    const message = {
      createWithPasscode: this.createWithPasscode,
      passCode,
      name: newSessionName
    };

    this.dialogRef.close(message);
  }

  cancel = () => {
    this.dialogRef.close();
  }

  setPasscodeEnabled = (event: boolean) => this.createWithPasscode = event;

  passCodeChanged = (_: Event) => {
    this.verifyPasscodesAreEqual();
  }

  verifyPassCodeChanged = (_: Event) => {
    this.verifyPasscodesAreEqual();
  }

  formValid = () => this.createWithPasscode ? this.passCodesAreEqual : true;

  private verifyPasscodesAreEqual = () => {
    this.passCodesAreEqual = this.passCode && this.passCode === this.verifyPassCode;
  }
}

export interface NewSession {
  createdBy: string;
  createWithPasscode: boolean;
  passCode: boolean;
  name: boolean;
}
