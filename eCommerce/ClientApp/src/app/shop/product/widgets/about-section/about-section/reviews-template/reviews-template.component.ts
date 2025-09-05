import { Component, Input, OnInit } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder } from "@angular/forms";
import { environment } from "environments/environment";
import { ReviewsService } from "src/app/Services/Review/reviews.service";
import { Products } from "src/app/shared/classes/product";
import { Review } from "src/app/shared/classes/review";

@Component({
  selector: "app-reviews-template",
  templateUrl: "./reviews-template.component.html",
  styleUrls: ["./reviews-template.component.scss"],
})
export class ReviewsTemplateComponent implements OnInit {
  componentName: string = "ProductLeftSidebarComponent";
  detailsSettings = environment.pagesSettings.DetailsSettings;

  @Input() product: Products = {};
  @Input() isMobile: boolean;

  imageObjects: Array<object>;

  starsHover: number;
  stars: number;
  StarsArray: number[] = [];

  reviewFormCollapse: boolean;

  starsForm: UntypedFormGroup | undefined;
  constructor(private fb: UntypedFormBuilder, public reviewService: ReviewsService) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.reviewFormCollapse = false;

    if (this.product?.reviews) {
      this.calculateStars();
      this.imageObjects = [...this.product.reviews]
       // .filter((x) => x.src?.indexOf("https://") != -1)
        .map((item) => ({
          src: item.src,
          productTitle: this.product.title,
          categoryTitle: this.product.subCategoryTitle,
          name: item.firstName?.length > 0 ? item.firstName : "Anonymous",
          rating: item.productStars,
        }));

      for (var i = 0; i < this.StarsArray.length; i++) {
        this.product.reviews = [...this.product.reviews].map((item) => ({
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
    }
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
    body.productId = this.product.id;
    body.productStars = this.stars;

    try {
      const oResult = await this.reviewService.Create(body);

      if (oResult.success) {
        // this.router.navigate(['/shop/product/', this.productId]);
        // this.toastEvokeService.success('Thank you', 'Your review has been sent successfully.').subscribe();
      }
    } catch (error) {
      // Handle errors as needed
      console.error("Error submitting review:", error);
    }
  }

  calculateStars() {
    for (var i = 1; i < 6; i++) {
      const counter = this.product?.reviews?.filter(
        (x) => x.productStars === i
      ).length;
      this.StarsArray.push(counter);
    }
    return 0;
  }
  openReviewCollapse() {
    this.reviewFormCollapse = !this.reviewFormCollapse;
  }
  onRateChange(stars: number) {
    var text = "";

    switch (stars) {
      case 0:
        text = "Not recommended";
        break;
      case 1:
        text = "Weak";
        break;
      case 2:
        text = "Avarage";
        break;
      case 3:
        text = "Good";
        break;
      case 4:
        text = "Excellent";
        break;
      default:
        text = "Not rated";
        break;
    }
    return text;
  }
}
