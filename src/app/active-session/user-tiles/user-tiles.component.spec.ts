import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTilesComponent } from './user-tiles.component';

describe('UserTilesComponent', () => {
  let component: UserTilesComponent;
  let fixture: ComponentFixture<UserTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
