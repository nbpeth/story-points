import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSessionTilesComponent } from './active-session-tiles.component';

describe('ActiveSessionTilesComponent', () => {
  let component: ActiveSessionTilesComponent;
  let fixture: ComponentFixture<ActiveSessionTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveSessionTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveSessionTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
