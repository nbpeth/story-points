import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionAuthorizationComponent } from './session-authorization.component';

describe('SessionAuthorizationComponent', () => {
  let component: SessionAuthorizationComponent;
  let fixture: ComponentFixture<SessionAuthorizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionAuthorizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
