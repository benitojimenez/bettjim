import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionLeftSidebar } from './collection-left-sidebar';

describe('CollectionLeftSidebar', () => {
  let component: CollectionLeftSidebar;
  let fixture: ComponentFixture<CollectionLeftSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionLeftSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionLeftSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
