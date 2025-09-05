import { Component, Input } from '@angular/core';
import { environment } from 'environments/environment';
import { BaseService } from 'src/app/Services/base.service';
import { ProductReviewCard } from 'src/app/shared/classes/reviewCard';

@Component({
  selector: 'app-review-card-clean',
  templateUrl: './review-card-clean.component.html',
  styleUrl: './review-card-clean.component.scss'
})
export class ReviewCardCleanComponent {
@Input() productReviewCard: ProductReviewCard;

env = environment;
defaultImage: string = this.env.placeholderSrc;
imageLoading: number = 1; 

constructor(public baseService: BaseService) {}

onImageLoad(): void {
  this.imageLoading = 0;
}

onImageError(): void {
  this.imageLoading = 2;
}

getImageSrc(imageSrc: string): string {
    // Check if the image source is a valid URL or local path and return accordingly
    return imageSrc.startsWith("http") ? imageSrc :  `assets/images/reviews/${imageSrc}`;
}
}
