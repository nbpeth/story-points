import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotSessionPasscodeComponent } from './forgot-session-passcode.component';

describe('ForgotSessionPasscodeComponent', () => {
  let component: ForgotSessionPasscodeComponent;
  let fixture: ComponentFixture<ForgotSessionPasscodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotSessionPasscodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotSessionPasscodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
