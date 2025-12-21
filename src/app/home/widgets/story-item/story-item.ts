import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StoryCategory {
  name: string;
  img: string;
  link?: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-story-item',
  imports: [CommonModule],
  templateUrl: './story-item.html',
  styleUrl: './story-item.scss',
})
export class StoryItem {
  // Input obligatorio moderno
  cat = input.required<StoryCategory>();
  
  
}
