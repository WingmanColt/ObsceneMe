import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { tap } from 'rxjs';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { ProductFilterService } from 'src/app/Services/Product/filters.service';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { SubscriptionTrackerService } from 'src/app/Services/Tracker/subscription-tracker.service';
import { Category, SubCategory } from 'src/app/shared/classes/categories';
import { Filters } from 'src/app/shared/classes/filters';
import { Menu } from 'src/app/shared/classes/menu';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesPageComponent {
  componentName: string = "CategoriesPageComponent";
  settings = environment.setting;
  
  currentCategory: Category | null = null;
  categoryItems: any[] = [];
  isLoaded: boolean = false;
  isMobile: boolean;
  isCollapsed: boolean = false; // Add this line
  
  constructor(
    private router: Router,
    private productsService: ProductsService, 
    private filterService: ProductFilterService,
    private device: BreakpointDetectorService,
    private subTracker: SubscriptionTrackerService) {
  }


  ngOnInit(): void {
    if (!this.settings.categoriesPage) return; // Disable functionality if setting is off

    this.isMobile = !this.device.isDevice('Desktop');
    this.loadCategories();
  }

  loadCategories(): void {
    const subCategories = this.productsService.categoriesWithSubs$
      .pipe(
        tap((categories: Category[]) => {
          // Process categories and subcategories in a single loop
          this.categoryItems = categories?.map(category => ({
            id: category.id,
            title: category.title,
            shortName: category.shortName,
            type: "extLink",
            image: category.icon,
            subCategories: category.subCategories
          }));
          
          this.settings.menu.forEach((menu: Menu) => {
            if (menu.children) {
              menu.children = this.categoryItems;
            }
          });       
         })
      )
      .subscribe(response => {
        this.isLoaded = true;
        this.currentCategory = response?.length ? response[0] : null;
      });

    // Track the subscription
    this.subTracker.track({
      subscription: subCategories,
      name: "subCategories",
      fileName: this.componentName,
    });
  }

  selectCategory(selectedCategory: Category): void {
    this.currentCategory = this.currentCategory?.id === selectedCategory?.id ? null : selectedCategory;
  }

  clickOnCategory(selectedCategory: Category): void {
    const id = selectedCategory !== undefined ? selectedCategory.id : undefined;
    this.filterService.updateFilter('categoryId', id)

       // Navigate to /shop with categoryId
       this.router.navigate(['/shop'], {
        queryParams: { categoryId: id },
      });
  }

  clickOnSubCategory(selectedCategory: Category, selectedSubCategory: SubCategory): void {
    const id = selectedCategory !== undefined ? selectedCategory.id : undefined;
    const subId = selectedSubCategory !== undefined ? selectedSubCategory.id : undefined;

    this.filterService.updateFilter('subCategoryId', id)

       // Navigate to /shop with categoryId
       this.router.navigate(['/shop'], {
        queryParams: { categoryId: id, subCategoryId: subId },
      });
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  trackById(index: number, entity: any): number {
    return entity.id;
  }
}
