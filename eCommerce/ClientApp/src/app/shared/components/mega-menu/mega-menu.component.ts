import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, RendererFactory2 } from '@angular/core';
import { environment } from 'environments/environment';
import { Category, SubCategory } from '../../classes/categories';
import { tap } from 'rxjs';
import { ProductFilterService } from 'src/app/Services/Product/filters.service';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { SubscriptionTrackerService } from 'src/app/Services/Tracker/subscription-tracker.service';
import { Menu } from '../../classes/menu';
import { Router } from '@angular/router';
import { Filters } from '../../classes/filters';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';

@Component({
  selector: 'app-mega-menu',
  templateUrl: './mega-menu.component.html',
  styleUrls: ['./mega-menu.component.scss']
})
export class MegaMenuComponent implements OnInit, OnDestroy {
  componentName: string = "MegaMenuComponent";
  settings = environment.setting;

  @Input() menuItem: Menu;
  @Output() IsMegaMenuActive = new EventEmitter<boolean>();

  isMegaMenuActive: boolean = false;
  isLoaded: boolean = false;
  onCategoriesPage: boolean = false; 

  renderer: Renderer2;
  touchTimeout: any;

  currentCategory: Category | null = null;
  categoryItems: any[] = [];

  constructor(
    private rendererFactory: RendererFactory2,     
    private productsService: ProductsService, 
    private filterService: ProductFilterService,
    private subTracker: SubscriptionTrackerService,
    private deviceService: BreakpointDetectorService,
    private router: Router // Inject Router here
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void { 
    if (!this.settings.megaMenuActive) return; // Disable functionality if setting is off

    this.setOverflow(false);
    this.loadCategories();
    this.checkIfOnCategoriesPage();
  }
  
  loadCategories(): void {
    const subCategories = this.productsService.categoriesWithSubs$
      .pipe(
        tap((categories: Category[]) => {
          // Determine whether to process for mobile or desktop
          const isMobile = this.deviceService.isDevice('Mobile');
          this.categoryItems = isMobile
            ? this.processMobileCategories(categories)
            : this.processDesktopCategories(categories);
  
          // Update menu children
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
  
  private processMobileCategories(categories: Category[]): any[] {
    // Handle mobile-specific category processing
    if (categories.length === 1) {
      return categories[0].subCategories?.map(subCategory => ({
        id: subCategory.id,
        title: subCategory.title,
        shortName: subCategory.shortName,
        type: "extLink",
        image: undefined,
      })) || [];
    }
  
    return categories?.map(category => ({
      id: category.id,
      title: category.title,
      shortName: category.shortName,
      type: "extLink",
      image: category.icon,
      subCategories: category.subCategories,
    }));
  }
  
  private processDesktopCategories(categories: Category[]): any[] {
    // Handle desktop-specific category processing
    return categories?.map(category => ({
      id: category.id,
      title: category.title,
      shortName: category.shortName,
      type: "extLink",
      image: category.icon,
      subCategories: category.subCategories,
    }));
  }
  

  selectCategory(selectedCategory: Category): void {
    this.currentCategory = this.currentCategory?.id === selectedCategory?.id ? null : selectedCategory;
  }

  clickOnCategory(selectedCategory: Category): void {
    const id = selectedCategory !== undefined ? selectedCategory.id : undefined;
    this.filterService.updateFilter('categoryId', id)
  }

  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.setOverflow(true);
  }
  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    clearTimeout(this.touchTimeout);
    this.touchTimeout = setTimeout(() => this.setOverflow(false), 300); // Adjust timeout as needed
  }

  setOverflow(set: boolean): void {
    this.isMegaMenuActive = set;
    this.IsMegaMenuActive.emit(this.isMegaMenuActive);

    if (set) {
      this.renderer.setStyle(document.documentElement, "overflow", "hidden");
    } else {
      this.renderer.removeStyle(document.documentElement, "overflow");
    }
  }

  checkIfOnCategoriesPage(): void {
    // Check if the current URL is '/pages/categories'
    this.onCategoriesPage = this.router.url === '/pages/categories';
  }
  ngOnDestroy(): void {
    this.subTracker.releaseAllForComponent(this.componentName);
    this.setOverflow(false);
  }

  trackById(index: number, entity: any): number {
    return entity.id;
  }
  navigateToLink(link: string, params?: any): void {
    this.router.navigate([link], { queryParams: params });
   }
}
