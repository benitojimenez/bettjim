import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryItem } from './story-item';

describe('StoryItem', () => {
  let component: StoryItem;
  let fixture: ComponentFixture<StoryItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
