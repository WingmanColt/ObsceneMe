import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { BaseService } from 'src/app/Services/base.service';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { ReviewsService } from 'src/app/Services/Review/reviews.service';
import { Review } from 'src/app/shared/classes/review';
import { ProductReviewCard } from 'src/app/shared/classes/reviewCard';
import { ReviewModalComponent } from 'src/app/shared/components/modal/review-modal/review-modal.component';

@Component({
  selector: 'app-reviews-page',
  templateUrl: './reviews-page.component.html',
  styleUrl: './reviews-page.component.scss'
})
export class ReviewsPageComponent implements OnInit, OnDestroy {
  defaultImage: string = environment.placeholderSrc;
  detailsSettings = environment.pagesSettings.DetailsSettings;
  
  imageLoading: number = 1;
  imageObjects: Array<object> = [];

  starsHover: number;
  stars: number;
  StarsArray: number[] = [];

  reviewFormCollapse: boolean;

  reviewsList: ProductReviewCard[]
  paginate: any = {};
  pageNo: number = 1;

  reviews: ProductReviewCard[] = [];
  averageRating?: number; // Average rating
  positiveRating?: number; // % of positive reviews (stars >= 4)
  isMobile: boolean;
  private destroy$ = new Subject<void>();

  starsForm: UntypedFormGroup | undefined;
  @ViewChild("reviewModal") ReviewModal: ReviewModalComponent | undefined;

  constructor(
    private baseService: BaseService,
    private fb: UntypedFormBuilder,
    private reviewsService: ReviewsService,
    public deviceDetector: BreakpointDetectorService
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.isMobile = this.deviceDetector.isDevice("Mobile");
    this.setPage(this.pageNo);
    this.reviewsService.GetAllReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: ProductReviewCard[]) => {
        this.reviews = response;
        
        this.calculateStars();
        this.imageObjects = this.reviews.map((item) => ({
          src: item.reviewImage,
          productTitle: item.productTitle,
          categoryTitle: '',
          name: item.firstName?.length > 0 ? item.firstName : "Anonymous",
          rating: item.productStars,
        }));

        for (var i = 0; i < this.StarsArray.length; i++) {
        this.reviews = [...this.reviews].map((item) => ({
          ...item,
          colour:
            "rgb(" +
            Math.floor(Math.random() * 200) +
            "," +
            Math.floor(Math.random() * 200) +
            "," +
            Math.floor(Math.random() * 200) +
            ")",
        }));
      }

        this.setPage(1);
      });

    this.reviewFormCollapse = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm() {
    this.starsForm = this.fb.group({
      stars: 0,
    });
  }

  onRateHover($event: any) {
    this.starsHover = $event;
  }

  async onRateSubmit() {
    const body = new Review();
    // Provide correct productId if needed
    body.productId = 0;
    body.productStars = this.stars;

    try {
      const oResult = await this.reviewsService.Create(body);

      if (oResult.success) {
        // Handle success (navigate, notify, etc.)
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  }

  calculateStars() {
    const totalReviews = this.reviews.length;
    const totalStars = this.reviews.reduce((sum, x) => sum + (x.productStars || 0), 0);
    const positiveReviews = this.reviews.filter((x) => x.productStars >= 4).length;

    this.StarsArray = [1, 2, 3, 4, 5].map(i =>
      this.reviews.filter((x) => x.productStars === i).length
    );

    // Average rating (1 to 5)
    this.averageRating = totalReviews > 0 ? (totalStars / totalReviews) : 0;

    // Positive rating in percent
    this.positiveRating = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;
  }

  openReviewCollapse() {
    this.reviewFormCollapse = !this.reviewFormCollapse;
  }

  onRateChange(stars: number) {
    switch (stars) {
      case 0: return "Not recommended";
      case 1: return "Weak";
      case 2: return "Average";
      case 3: return "Good";
      case 4: return "Excellent";
      case 5: return "Excellent";
      default: return "Not rated";
    }
  }

    // product Pagination
  setPage(page: number) {
    this.paginate = this.baseService.getPager(this.reviews?.length, page); // get paginate object from service

    const transformedReviews = this.reviews?.map(review => ({
      ...review,
      formattedCreatedOn: this.getFormatedDate(review.createdOn),
    })) || [];
    // Get current 


    this.reviewsList = transformedReviews?.slice(this.paginate.startIndex, this.paginate.endIndex + 1); // get current page of items
  }

  getImageSrc(imageSrc: string): string {
    // Check if the image source is a valid URL or local path and return accordingly
    return imageSrc.startsWith("http") ? imageSrc :  `assets/images/reviews/${imageSrc}`;
  }

  onImageLoad(): void {
    this.imageLoading = 0;
  }

  onImageError(): void {
    this.imageLoading = 2;
  }

  getFormatedDate(date: string) {
    return this.baseService.getFormattedDate(date, false);
  }

}