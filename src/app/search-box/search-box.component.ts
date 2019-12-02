import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent {
  @Output() searchBoxValue: EventEmitter<string> = new EventEmitter<string>();

  searchBoxChanged = (event: any) => {
    this.searchBoxValue.emit(event.target.value);
  }
}
