import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingBoothComponent } from './voting-booth.component';

describe('VotingBoothComponent', () => {
  let component: VotingBoothComponent;
  let fixture: ComponentFixture<VotingBoothComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VotingBoothComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingBoothComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
