import { Component, OnDestroy, OnInit} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ReviewsService } from 'src/app/Services/Review/reviews.service';

@Component({
  selector: 'app-product-review-carousel',
  templateUrl: './product-review-carousel.component.html',
  styleUrls: ['./product-review-carousel.component.scss'],
})
export class ProductReviewCarouselComponent implements OnInit, OnDestroy {
  sliderConfig: any = {
    slideChangeDelay: 50,
    title:'User reviews',
    draggable: true,
    delay: 5000, 
    breakpoints: {
      mobile: { slideWidth: 100, slidesPerView: 1 },
      tablet: { navEnabled: true, slideWidth: 50, slidesPerView: 2 },
      desktop: { navEnabled: true, slideWidth: 50, slidesPerView: 2 }
    }
  };

  private destroy$ = new Subject<void>(); 
  constructor(private reviewService: ReviewsService) {

  }

  ngOnInit(): void {
   this.reviewService.getProductReviewCards()
   .pipe(takeUntil(this.destroy$))
   .subscribe(entities => {
    this.sliderConfig.slides = entities;
   });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
