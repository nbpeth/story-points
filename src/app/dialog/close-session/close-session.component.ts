import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material";

@Component({
  selector: 'app-close-session',
  templateUrl: './close-session.component.html',
  styleUrls: ['./close-session.component.scss']
})
export class CloseSessionComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}

  ngOnInit() {
  }

}
