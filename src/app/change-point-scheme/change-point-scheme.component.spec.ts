import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePointSchemeComponent } from './change-point-scheme.component';

describe('ChangePointSchemeComponent', () => {
  let component: ChangePointSchemeComponent;
  let fixture: ComponentFixture<ChangePointSchemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePointSchemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePointSchemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
