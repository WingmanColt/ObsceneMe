import { Component, OnInit, Input } from "@angular/core";
import { BaseService } from "src/app/Services/base.service";
import { Review } from "src/app/shared/classes/review";

@Component({
  selector: "app-review-comments",
  templateUrl: "./review-comments.component.html",
  styleUrls: ["./review-comments.component.scss"],
})
export class ReviewCommentsComponent implements OnInit {
  @Input() reviews: Review[] = [];
  @Input() pageNo: number = 1;
  @Input() isMobile: boolean;

  public reviewsList: Review[];
  public paginate: any = {};
  public isLoaded: boolean = false;

  constructor(private baseService: BaseService) { }

  ngOnInit(): void {
    this.setPage(this.pageNo);
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

  getFormatedDate(date: string) {
    return this.baseService.getFormattedDate(date, false);
  }

}
