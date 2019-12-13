import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  id: string;
  message: string;
  isDarkTheme: boolean;

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private themeService: ThemeService,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.id = data.id;
    this.message = data.message;
  }

  ngOnInit() {
    this.themeService.loadState();
    this.themeService.isDarkTheme.subscribe(isDarkTheme => {
      this.isDarkTheme = isDarkTheme
    });
  }

  close = (shouldClose: boolean) => {
    this.dialogRef.close(shouldClose)
  }

}
