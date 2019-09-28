import {Component, Input} from '@angular/core';

@Component({
  selector: 'active-session-tile',
  templateUrl: './active-session-tile.component.html',
  styleUrls: ['./active-session-tile.component.scss']
})
export class ActiveSessionTileComponent {
  @Input() id: string;

  urlEncode = (id: string) => encodeURIComponent(id);
}
