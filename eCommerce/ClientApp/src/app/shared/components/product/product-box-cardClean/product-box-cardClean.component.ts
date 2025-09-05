import { Component, Input, ViewChild, ElementRef, OnInit } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { MarketStatus, PremiumPackage, Products } from "../../../classes/product";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";
import { FavouritesService } from "src/app/Services/Favourites/favourites.service";
import { Router } from "@angular/router";
import { Trademarks, Trademarks_LabelMapping } from "src/app/shared/classes/enums/trademarks";
import { ConfigService } from "src/app/Services/config.service";

@Component({
  selector: "app-product-box-cardClean",
  templateUrl: "./product-box-cardClean.component.html",
  styleUrls: ["./product-box-cardClean.component.scss"],
})
export class ProductBoxCardCleanComponent implements OnInit {
  @Input() product: Products;
  @Input() multiButtons: boolean;
  @Input() class: string;

  @ViewChild("el") element: ElementRef;
  @ViewChild("quickView") QuickView: QuickViewComponent;

  MarketStatus = MarketStatus;
  Trademark = Trademarks;
  PremiumPackage = PremiumPackage;

  public trademarkLabelMapping = Trademarks_LabelMapping; // Mapping object

  defaultImage: string = environment.placeholderSrc;
  env = environment;
  settings = this.env.cardsSettings.cardCleanSettings;

  hover: boolean = false;
  isHovered: boolean = false;

  currentImageIndex: number = 0;
  rotationCount: number = 0;
  intervalId: any;
  imageLoading: number = 1; 
  hostingPath: string = this.env.hostingPath;

  categoriesActive: boolean;
  occasionActive: boolean;
  brandActive: boolean;
  trademarkActive: boolean;
  variantActive: boolean;
  
  constructor(
    private configService: ConfigService,
    private router: Router, 
    public baseService: BaseService, 
    private favouriteService: FavouritesService) {

      this.categoriesActive = this.configService.getSetting('CategoriesActive');
      this.occasionActive = this.configService.getSetting('OccasionActive');
      this.brandActive = this.configService.getSetting('BrandActive');
      this.trademarkActive = this.configService.getSetting('TrademarkActive');
      this.variantActive = this.configService.getSetting('VariantActive');
    }

  ngOnInit(): void {
    // this.isInFavourites$ = this.favouriteService.isProductInFavourites(this.product);
  }

  onMouseOver() {
    this.isHovered = true;
  }
  onMouseLeaved() {
    this.isHovered = false;
  }

  onMouseEnter(): void {
    this.hover = true;
    this.startImageRotation();
  }

  onMouseLeave(): void {
    this.hover = false;
    this.stopImageRotation();
    this.rotationCount = 0;
  }

  startImageRotation(): void {
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images?.length;
      this.rotationCount++;

      if (this.rotationCount >= this.product.images?.length) {
        this.stopImageRotation();
        this.hover = false; // Optional: if you want to hide the progress bar after rotation is complete
      }
    }, 1000);
  }

  handleSubCategoryRouting(): void {
    this.router.navigate(['/shop'], {
      queryParams: {
        categoryId: this.product.categoryId || null,
        subCategoryId: this.product.subCategoryId || null
      }
    });
   }
   handleTrademarkRouting(): void {
    this.router.navigate(['/shop'], {
      queryParams: {
        trademarks: this.product.trademark || null
      }
    });
   }

  onImageLoad(): void {
    this.imageLoading = 0;
  }

  onImageError(): void {
    this.imageLoading = 2;
  }

  stopImageRotation(): void {
    clearInterval(this.intervalId);
  }

  getAnimationDuration(): string {
    return `${(this.product?.images?.length || 0) * 1000}ms`;
  }

  getImageSrc(imageSrc: string): string {
    return imageSrc.startsWith("http") ? imageSrc :  `assets/images/${sanitizeTitle(this.product.title)}/${imageSrc}`;
  }

  async addOrRemoveFavourite(): Promise<void> {
    await this.favouriteService.addToFavouritesAsync(this.product);
  }

getEnumKeyByValue(value: number): string | undefined {
  return Object.keys(Trademarks).find(key => Trademarks[key as keyof typeof Trademarks] === value);
}
}


function sanitizeTitle(title: string): string {
  // Replace invalid file system characters with an underscore
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g; // Regex for invalid file/folder characters
  const sanitizedTitle = title.replace(invalidChars, '_');

  // Trim spaces and normalize the title
  return sanitizedTitle.trim();
}


