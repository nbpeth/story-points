import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {PointVisibilityChange} from '../control-panel/control-panel.component';

@Component({
  selector: 'admin-controls',
  templateUrl: './admin-controls.component.html',
  styleUrls: ['./admin-controls.component.scss']
})
export class AdminControlsComponent implements OnInit {
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> = new EventEmitter<PointVisibilityChange>();

  constructor() {
  }

  ngOnInit() {
  }

  changePointVisibility = (state: PointVisibilityChange) => {
    this.pointVisibilityEvent.emit(state);
  }
}
