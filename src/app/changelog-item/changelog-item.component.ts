import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-changelog-item',
  templateUrl: './changelog-item.component.html',
  styleUrls: ['./changelog-item.component.scss']
})
export class ChangelogItemComponent implements OnInit {
  @Input() date: string;
  @Input() content: string;

  constructor() { }

  ngOnInit(): void {
  }

}
