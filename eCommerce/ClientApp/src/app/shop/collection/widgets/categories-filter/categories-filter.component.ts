import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { ProductsService } from "../../../../Services/Product/products.service";
import { distinctUntilChanged, tap } from "rxjs";
import { environment } from "environments/environment";
import { Category, SubCategory } from "src/app/shared/classes/categories";
import { SubscriptionTrackerService } from "src/app/Services/Tracker/subscription-tracker.service";
import { ProductFilterService } from "src/app/Services/Product/filters.service";
import { ConfigService } from "src/app/Services/config.service";

@Component({
  selector: "app-categories-filter",
  templateUrl: "./categories-filter.component.html",
  styleUrls: ["./categories-filter.component.scss"],
})
export class CategoriesFilterComponent implements OnInit, OnDestroy {
  componentName: string = "CategoriesFilterComponent";
  enviroment = environment;
  collectionSettings = environment.pagesSettings.CollectionSettings;
  categoriesActive: boolean;

  currentCategory: Category = {};
  currentSubCategory: SubCategory = {};

  categories: Category[];
  collapse: boolean = true;

  @Input() urlCategoryId: number | undefined;
  @Input() urlSubCategoryId: number | undefined;
  @Output() selectedCategories = new EventEmitter<object>();

  constructor(
    private configService: ConfigService,
    public productService: ProductsService, 
    private subTracker: SubscriptionTrackerService, 
    private filterService: ProductFilterService) {
      this.categoriesActive = this.configService.getSetting('CategoriesActive');
  }
  
  
  ngOnInit(): void {
    if (!this.categoriesActive) return; // Disable functionality if setting is off

    // Load categories with subcategories
    this.loadCategories();
  }

  loadCategories(): void {
    // Load categories with subcategories
    const subCategories = this.productService.categoriesWithSubs$
      .pipe(
        distinctUntilChanged(), 
        tap((entityArray: Category[]) => {
          this.categories = entityArray?.map((category) => this.setCategoryProperties(category));
        })
      )
      .subscribe((x) => {this.categories = x});
  
    // Track the subscription
    this.subTracker.track({
      subscription: subCategories,
      name: "subCategories",
      fileName: this.componentName,
    });
  }

  selectCategory(selectedCategory: Category | undefined): void {
    this.currentCategory = this.currentCategory?.id === selectedCategory?.id ? null : selectedCategory;
    this.filterService.updateFilter('categoryId', this.currentCategory?.id)
    this.filterService.updateFilter('subCategoryId', null)
    this.emitSelectedCategories(this.currentCategory, null);
  }

  selectSubCategory(selectedSubCategory: SubCategory | undefined): void {
    this.currentSubCategory = this.currentSubCategory?.id === selectedSubCategory?.id ? null : selectedSubCategory;
    this.filterService.updateFilter('subCategoryId', this.currentSubCategory?.id)
    this.emitSelectedCategories(this.currentCategory, this.currentSubCategory);
  }

  ngOnDestroy() {
    this.subTracker.releaseAllForComponent(this.componentName);
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

  emitSelectedCategories(category: Category | undefined, subCategory:SubCategory | undefined) {
    this.selectedCategories.emit({category: category, subCategory: subCategory});  // Set Page Number  
  }
  trackById(index: number, entity: Category): number {
    return entity.id;
  }
}
