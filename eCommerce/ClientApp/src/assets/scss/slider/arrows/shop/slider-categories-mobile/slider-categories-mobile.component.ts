import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { Subject, takeUntil, tap } from "rxjs";
import { ProductFilterService } from "src/app/Services/Product/filters.service";
import { ProductsService } from "src/app/Services/Product/products.service";
import { Category, SubCategory } from "src/app/shared/classes/categories";
import { SimpleSliderComponent2 } from "src/app/shared/slider/simple-slider.component";


@Component({
  selector: "app-slider-categories-mobile",
  templateUrl: "./slider-categories-mobile.component.html",
  styleUrls: ["./slider-categories-mobile.component.scss"],

})
export class SliderCategoriesMobileComponent implements OnInit, OnDestroy {
  componentName: string = "SliderCategoriesMobileComponent";

  env = environment;
  collectionSettings = environment.pagesSettings.CollectionSettings;
  imageSrc = './assets/images/CategoryImages/';

  categories: Category[];
  isCategorySlides: boolean = false;

  @Input() urlCategoryId: number | undefined;
  @Input() urlSubCategoryId: number | undefined;

  currentCategory: Category | undefined;
  currentSubCategory: SubCategory | undefined;

  imageLoading: boolean = true; 
  private destroy$ = new Subject<void>(); 

  @ViewChild('SliderCategoriesBadges') sliderRef!: SimpleSliderComponent2;
  sliderConfig: any = {
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000, 
    changeToClickedSlide:true,
    breakpoints: {
      mobile: { slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
    }
  }

  constructor(
    private router: Router,
    private productService: ProductsService, 
    private filterService: ProductFilterService) { }


  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
     this.productService.categoriesWithSubs$
      .pipe(
        takeUntil(this.destroy$),
        tap((entityArray: Category[]) => {
          this.categories = entityArray.map((category) =>
            this.setCategoryProperties(category)
          );
        })
      )
        .subscribe((entities: Category[]) => {
          if (entities.length === 1) {
            this.sliderConfig.slides = entities[0].subCategories;
            this.isCategorySlides = false;
          } 
    
          else if (entities.length > 1) {
            this.sliderConfig.slides = entities;
            this.isCategorySlides = true;
          }
    
         this.sliderRef?.sliderInit();
        });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleOnClick($event: any): void {
    if(this.isCategorySlides) {
    this.currentCategory = this.currentCategory?.id === $event?.id ? null : $event;
    this.filterService.updateFilter('categoryId', this.currentCategory?.id)
    this.filterService.updateFilter('subCategoryId', null)
    } else {
    this.currentSubCategory = this.currentSubCategory?.id === $event?.id ? null : $event;
    this.filterService.updateFilter('subCategoryId', this.currentSubCategory?.id)
    }

    this.router.navigate(['/shop'], {
      queryParams: {
        categoryId: this.currentCategory?.id || null,
        subCategoryId: this.currentSubCategory?.id || null
      }
    });
  }

    setCategoryProperties(category: Category): Category {
      // Check if the category matches the URL categoryId
    if (category.id === this.urlCategoryId) {
      this.currentCategory = category;
      category.isSelected = true;
    }
  
    // Recursively traverse subcategories
    if (category.subCategories) {
      category.subCategories.forEach((subCategory) => {

        if(subCategory.id === this.urlSubCategoryId){
          this.currentSubCategory = subCategory;
          subCategory.isSelected = true;
        }
      });
    }
  
    return category;
  }

  resetCurrentCategory() {
    this.currentCategory = undefined;
    
    this.filterService.updateFilter('categoryId', undefined)
    this.filterService.updateFilter('subCategoryId', undefined)
  }
  
  onImageLoad() {
    this.imageLoading = false;
  }

  onImageError() {
    this.imageLoading = false;
  }
  getCategoryImageUrl(slide: any): string {
    const baseUrl = this.env.setting.categoryImageUrl;
    const extension = this.env.setting.categoryImageUrlExtension;
  
    if (this.isCategorySlides) {
      return `${baseUrl}${slide.icon}${extension}`;
    }

    return `${baseUrl}${slide.categoryShortName}/${slide.icon}${extension}`;
  }
  trackById(index: number, entity: Category): number {
    return entity.id;
  }
}
