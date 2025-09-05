import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductsService } from "../../../../Services/Product/products.service";
import { environment } from "environments/environment";
import { ReviewModalComponent } from "src/app/shared/components/modal/review-modal/review-modal.component";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";
import { RelatedProductsComponent } from "src/app/shared/swiper/shop/related-swiper/related-products.component";
import { ProductDetails } from "src/app/shared/classes/productDetails";
import { slugify } from "src/app/utils/slugify.util";
import { of, Subject, switchMap, takeUntil } from "rxjs";

@Component({
  selector: "app-product-left-sidebar",
  templateUrl: "./product-left-sidebar.component.html",
  styleUrls: ["./product-left-sidebar.component.scss"],
})
export class ProductLeftSidebarComponent implements OnInit, OnDestroy {
  componentName: string = "ProductLeftSidebarComponent";
  currBreadCrumb: BreadcrumbObject[];
  detailsSettings = environment.pagesSettings.DetailsSettings;

  productQuery: string;

  product: ProductDetails | undefined = undefined;
  isProductLoaded = false;
  productNotFound = false;
  isMobile: boolean;

  RelatedProductsComponent: any = RelatedProductsComponent;
  relatedComponentVisible: boolean = false;

  private destroy$ = new Subject<void>(); 
  @ViewChild("reviewModal") ReviewModal: ReviewModalComponent | undefined;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public route: ActivatedRoute,
    public productService: ProductsService,
    public deviceDetector: BreakpointDetectorService
  ) {}

ngOnInit(): void {
  this.isMobile = this.deviceDetector.isDevice("Mobile");

  this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const value = params['value'];
        if (!value) return of(undefined);

        const query = /^\d+$/.test(value) ? value : slugify(value);
        this.productQuery = query;

        // ✅ NOW this gets subscribed to
        return this.productService.productDetails$(query);
      })
    )
    .subscribe({
      next: (product) => {
        if (!product) {
          this.productNotFound = true;
          this.isProductLoaded = false;
          return;
        }

        this.getProduct(product);
      },
      error: (err) => {
        console.error("Product fetch failed", err);
        this.productNotFound = true;
        this.isProductLoaded = false;
      }
    });
}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProduct(productData: ProductDetails | undefined): void {

    if (productData == undefined) {
      this.productNotFound = true;
      this.isProductLoaded = false;
      this.cdr.detectChanges(); // optional but helps force re-render
      return;
    }

    this.productNotFound = false;
    this.isProductLoaded = true;
    this.product = productData;

    const slug = this.product.shortName || slugify(this.product.title);
    this.router.navigate(
      ['/shop/product', slug],
      { replaceUrl: true } // 👈 avoid adding to browser history
    );


    this.currBreadCrumb = [
      { title: "Shop", url: "/shop" },
      { title: this.product.title, url: "/shop/product/" + this.product.title },
    ];
  }

  isLoaded($event) {
    this.isProductLoaded = $event;
  }
}
