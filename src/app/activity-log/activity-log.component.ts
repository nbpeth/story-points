import {Component, Input} from '@angular/core';

@Component({
  selector: 'activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent  {
  @Input() logs: string[];


}
