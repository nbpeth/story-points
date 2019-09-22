import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'active-session-tile',
  templateUrl: './active-session-tile.component.html',
  styleUrls: ['./active-session-tile.component.scss']
})
export class ActiveSessionTileComponent {
  @Input() id: string;

  onChanges(change) {
    console.log('active sessiont ile!', change)
  }
}
