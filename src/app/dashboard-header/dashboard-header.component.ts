import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  @Output() searchBoxValue: EventEmitter<string> = new EventEmitter<string>();
  @Output() createSession: EventEmitter<string> = new EventEmitter<string>();

  searchValueChanged = (value: string) => {
    this.searchBoxValue.emit(value);
  }

  createNewSession = (withName: string) => {
    this.createSession.emit(withName);
  }
}
