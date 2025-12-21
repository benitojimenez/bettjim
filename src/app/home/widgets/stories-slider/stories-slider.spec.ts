import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoriesSlider } from './stories-slider';

describe('StoriesSlider', () => {
  let component: StoriesSlider;
  let fixture: ComponentFixture<StoriesSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoriesSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoriesSlider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
