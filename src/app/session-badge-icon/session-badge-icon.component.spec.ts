import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionBadgeIconComponent } from './session-badge-icon.component';

describe('SessionBadgeIconComponent', () => {
  let component: SessionBadgeIconComponent;
  let fixture: ComponentFixture<SessionBadgeIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionBadgeIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionBadgeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
