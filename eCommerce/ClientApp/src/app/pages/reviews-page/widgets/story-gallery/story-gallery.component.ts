import { Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-story-gallery',
  templateUrl: './story-gallery.component.html',
  styleUrl: './story-gallery.component.scss'
})
export class StoryGalleryComponent {
  reviewImages = environment.pagesSettings.ReviewsSettings.reviewImages;

  getLeft(index: number): string {
    const col = index % 4;
    return `${col * 25}%`;
  }

  getTop(index: number): string {
    const row = Math.floor(index / 4);
    return `${row * 381}px`;
  }
}
