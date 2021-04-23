import {Component, Input} from '@angular/core';

@Component({
  selector: 'session-badge-icon',
  templateUrl: './session-badge-icon.component.html',
  styleUrls: ['./session-badge-icon.component.scss']
})
export class SessionBadgeIconComponent {
  @Input() public badge: { icon: string, display: string };
}
