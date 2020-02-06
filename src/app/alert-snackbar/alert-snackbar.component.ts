import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material';

@Component({
  selector: 'app-alert-snackbar',
  templateUrl: './alert-snackbar.component.html',
  styleUrls: ['./alert-snackbar.component.scss']
})
export class AlertSnackbarComponent implements OnInit {
  private message: string;
  private labelClass: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: any) {
    this.message = data.message;
    this.labelClass = data.labelClass;
  }

  ngOnInit() {
  }

}
