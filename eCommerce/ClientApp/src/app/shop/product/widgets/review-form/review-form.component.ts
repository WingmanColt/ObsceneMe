import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder, Validators } from "@angular/forms";
import { ProductsService } from "src/app/Services/Product/products.service";
import { ReviewsService } from "src/app/Services/Review/reviews.service";
import { SubscriptionTrackerService } from "src/app/Services/Tracker/subscription-tracker.service";
import { DropdownItem } from "src/app/shared/classes/dropdown";
import { Product2 } from "src/app/shared/classes/products/products";
import { Review } from "src/app/shared/classes/review";

@Component({
  selector: "app-review-form",
  templateUrl: "./review-form.component.html",
  styleUrls: ["./review-form.component.scss"],
})
export class ReviewFormComponent implements OnInit, OnDestroy {
  componentName: string = "ProductLeftSidebarComponent";

  @Input() productId: number | undefined;
  @Input() icon: string;
  @Input() iconColor: string;
  @Input() isModal: boolean;
  @Input() isMobile: boolean;

  stars: number;
  isReviewSend: boolean = false;
  isFileUploaded: boolean = false;
  error: any;
  starsHover: number;
  reviewForm: UntypedFormGroup | undefined;

  productOptions: Product2[] = [];
  dropdownArray: DropdownItem[] = [];

  constructor(
    public reviewService: ReviewsService, 
    private productService: ProductsService,
    private subTracker: SubscriptionTrackerService, 
    private fb: UntypedFormBuilder) { 

      this.reviewForm = this.fb.group({
      firstname: ["", [Validators.required, Validators.minLength(3)]],
      lastname: ["", [Validators.required, Validators.minLength(3)]],
      orderCode: ["", [Validators.required]],
      about: ["", [Validators.required]],
      productId: 0,
      productStars: 0,
      src: [""],
      sendToSupport: false,
    });
    }

  async ngOnInit(): Promise<void> {
    if(!this.productId) {
    this.productOptions = await this.productService.getProductsAsync() || [];
    this.dropdownArray = this.mapProductsToDropdownItems(this.productOptions);
    }

  }

  ngOnDestroy() {
    this.subTracker.releaseAllForComponent(this.componentName);
  }

  onRateHover($event: any) {
    this.starsHover = $event;
  }


  async onSubmit(body: Review) {
    if (this.reviewForm.invalid) return;

    body.productId = this.productId;
    body.productStars = this.stars;

    try {
      const oResult = await this.reviewService.Create(body);

      if (oResult.success)
        this.isReviewSend = true;
      else
        this.error = oResult.failureMessage;

    } catch (error) {
      // Handle errors as needed
      console.error('Error submitting review:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      // Check the file's MIME type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/avif',
      ];
  
      if (!allowedMimeTypes.includes(file.type)) {
        alert('Invalid file type. Please select an image of type JPG, JPEG, PNG, GIF, WebP, or AVIF.');
        return; // Prevent further processing if the file type is invalid
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        // Set the base64 string to the form control
        this.reviewForm.controls['src'].setValue(reader.result as string);
        this.isFileUploaded = true;
      };
  
      reader.readAsDataURL(file); // Convert file to base64 string
    }
  }
  
  triggerFileInput(): void {
    const fileInput: HTMLInputElement = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput.click(); // Trigger file input dialog when user clicks the input or icon
  }
  resetFileUpload(): void {
    this.isFileUploaded = false; // Reset the flag to allow the user to select a new file
    this.reviewForm.controls['src'].setValue(''); // Reset the form control (empty)
    
    // Optional: If you want to reset the file input visually, you can reset the file input element itself
    const fileInput: HTMLInputElement = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput.value = ''; // Clear the file input field
  }
    getRateText(stars: number) {
      var text = "";
      var color = "";
  
      switch (stars) {
        case 0:
          text = "Not recommended";
          color = "#000";
          break;
        case 1:
          text = "Weak";
          color = "rgb(219, 123, 37)";
          break;
        case 2:
          text = "Avarage";
          color = "rgb(251, 174, 6)";
          break;
        case 3:
          text = "Good";
          color = "rgb(176, 203, 30)";
          break;
        case 4:
          text = "Excellent";
          color = "rgb(26, 208, 0)";
          break;
        default:
          text = "Not rated";
          color = "#000";
      }
      return { text: text, color: color };
  }

  mapProductsToDropdownItems(products: Product2[]): DropdownItem[] {
  return products.map(product => ({
    id: product.id,
    label: product.title || '', // fallback if title is undefined
    image: product.image || '', // optional
    isSelected: false,
    origin: 'first' // or 'second' depending on use case
  }));
}

  onProductSelected(value: DropdownItem[] | any, index: number): void {
    if (!Array.isArray(value) || value.length === 0) {
      return; // no selection or empty array
    }

    const firstItem = value[0];
    const productId = +firstItem.id; // convert id to number if needed

    const selected = this.productOptions.find(p => p.id === productId);
    if (!selected) return;

    this.productId = selected.id;
  }
}
