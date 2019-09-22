import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSessionTileComponent } from './active-session-tile.component';

describe('ActiveSessionTileComponent', () => {
  let component: ActiveSessionTileComponent;
  let fixture: ComponentFixture<ActiveSessionTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveSessionTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveSessionTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
