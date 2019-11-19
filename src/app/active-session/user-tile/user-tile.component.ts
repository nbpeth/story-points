import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'user-tile',
  templateUrl: './user-tile.component.html',
  styleUrls: ['./user-tile.component.scss']
})
export class UserTileComponent implements OnInit {
  @Input() participant: any;
  @Input() pointsAreHidden: boolean;
  @Input() myCard: boolean;

  constructor() {
  }

  ngOnInit() {
  }

}
