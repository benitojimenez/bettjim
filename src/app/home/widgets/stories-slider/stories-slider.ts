import { Component, ElementRef, ViewChild, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryItem, StoryCategory } from '../story-item/story-item';
// Definimos la forma de los datos

@Component({
  selector: 'app-stories-slider',
  imports: [CommonModule, StoryItem],
  templateUrl: './stories-slider.html',
  styleUrl: './stories-slider.scss',
})
export class StoriesSlider {
    // ✅ RECIBIMOS LA DATA COMO SIGNAL (Requerido)
  categories = input.required<StoryCategory[]>();

}
