import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileBadgeBucketComponent } from './tile-badge-bucket.component';

describe('TileBadgeBucketComponent', () => {
  let component: TileBadgeBucketComponent;
  let fixture: ComponentFixture<TileBadgeBucketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileBadgeBucketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileBadgeBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
