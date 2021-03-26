import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSessionTileComponent } from './create-session-tile.component';

describe('CreateSessionTileComponent', () => {
  let component: CreateSessionTileComponent;
  let fixture: ComponentFixture<CreateSessionTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSessionTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSessionTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
