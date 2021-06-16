import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {NameBuilder} from '../name-builder';

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


  constructor(private dialogRef: MatDialogRef<CreateSessionDialogComponent>) {
  }

  create = (name: string) => {
    const newSessionName = name ? name : NameBuilder.generate();

    const message = { createWithPasscode: this.createWithPasscode, passCode: this.createWithPasscode ? this.passCode : undefined, name: newSessionName };

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
  createWithPasscode: boolean;
  passCode: boolean;
  name: boolean;
}
