import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BallotDisplayComponent } from './ballot-display.component';

describe('BallotDisplayComponent', () => {
  let component: BallotDisplayComponent;
  let fixture: ComponentFixture<BallotDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BallotDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BallotDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
