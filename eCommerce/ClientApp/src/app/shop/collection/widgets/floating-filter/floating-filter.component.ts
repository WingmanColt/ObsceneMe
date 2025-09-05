import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { ProductFilterService } from 'src/app/Services/Product/filters.service';
import { DropdownItem } from 'src/app/shared/classes/dropdown';
import { Filters } from 'src/app/shared/classes/filters';
import { SliderCategoriesMobileComponent } from 'src/app/shared/swiper/shop/slider-categories-mobile/slider-categories-mobile.component';

@Component({
  selector: 'app-floating-filter',
  templateUrl: './floating-filter.component.html',
  styleUrls: ['./floating-filter.component.scss'],
})
export class FloatingFilterComponent implements OnInit {
  @Input() totalItems: number = 0; // Total items to display
  @Input() selectedFilters: Filters; // Input array containing filter parameters

  collectionSettings = environment.pagesSettings.CollectionSettings;
  dropdownItems: DropdownItem[] = [];
  dropdownItemsTwo: DropdownItem[] = [];

  position: number = 300; // Initial position of the button
  isDrawerOpen: boolean = false; // State of the drawer
  isMobile: boolean;

  mobileSortBy: boolean = false;
  selectedSortItem: any;
  selectedDirectionItem: any;

  SliderCategoriesMobileComponent: any = SliderCategoriesMobileComponent; 
  
  @Output() selectedCategories = new EventEmitter<object>();

  reusableFilters = [
    {
      setting: 'genderOnFilters',
      title: 'Gender',
      items: this.collectionSettings.genderOptions,
      selectedKey: 'genderId',
      isMultipleSelection: false,
      updateFn: this.onGendersSelectionChange.bind(this)
    },
    {
      setting: 'ratingOnFilters',
      title: 'Rating',
      items: this.collectionSettings.starOptions,
      selectedKey: 'ratingId',
      isMultipleSelection: false,
      updateFn: this.onStarsSelectionChange.bind(this)
    },
    {
      setting: 'statusOnFilters',
      title: 'Status',
      items: this.collectionSettings.statusOptions,
      selectedKey: 'statusId',
      isMultipleSelection: false,
      updateFn: this.onStatusesSelectionChange.bind(this)
    }
  ];

  
  private isDragging: boolean = false;
  private destroy$ = new Subject<void>(); // Subject for managing component destruction

  constructor(
    private deviceService: BreakpointDetectorService,
    private filterService: ProductFilterService
  ) {}

  ngOnInit(): void {
    this.isMobile = !this.deviceService.isDevice('Desktop');

    // Populate dropdown items for sorting
    this.mapSortOptionsToDropdownItems(this.collectionSettings.sortOptions);

    console.log(this.selectedFilters)
  }


  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen; // Toggle drawer visibility
  }

  toggleSortBy(): void {
    this.mobileSortBy = !this.mobileSortBy;
  }

  onSortChange(option: DropdownItem[]) {
    const sort = option[0]?.id;
    this.filterService.updateFilter('sortBy', sort);

    const direction = option[1]?.id;
    this.filterService.updateFilter('sortDirection', direction);
  }

  onPriceChange($event: { minPrice: number; maxPrice: number | undefined }) {
    this.filterService.updateFilter('minPrice', $event.minPrice);
    this.filterService.updateFilter('maxPrice', $event.maxPrice);
  }

  // Handle gender selection
  onGendersSelectionChange(selectedId: number | undefined): void {
    this.filterService.updateFilter('genderId', selectedId);
  }

  // Handle rating selection (stars)
  onStarsSelectionChange(selectedId: number | undefined): void {
    this.filterService.updateFilter('ratingId', selectedId);
  }

  // Handle status selection
  onStatusesSelectionChange(selectedId: number | undefined): void {
    this.filterService.updateFilter('statusId', selectedId);
  }
  onTrademarkSelectionChange($event): void {
   this.filterService.updateFilter('trademarks', $event);
  }
  onBrandSelectionChange($event) : void {
    this.filterService.updateFilter('brands', $event.brands);
    this.filterService.updateFilter('brandSeries', $event.series);
    this.filterService.updateFilter('subBrands', $event.subBrands);
  }
  // Handle dragging functionality for the floating button
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true; // Start dragging
    const offsetY = event.clientY - this.position;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (this.isDragging) {
        this.position = moveEvent.clientY - offsetY; // Update position
      }
    };

    const onMouseUp = () => {
      this.isDragging = false; // Stop dragging
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onTouchStart(event: TouchEvent): void {
    this.isDragging = true; // Start dragging
    const touchY = event.touches[0].clientY - this.position;

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (this.isDragging) {
        this.position = moveEvent.touches[0].clientY - touchY; // Update position
      }
    };

    const onTouchEnd = () => {
      this.isDragging = false; // Stop dragging
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  }

  private mapSortOptionsToDropdownItems(sortOptions: any[]): void {
    this.dropdownItems = sortOptions
      .filter(option => option.origin === 'first')  // Filter for sort options
      .map(option => ({
        id: option.id,
        label: option.label,
        origin: option.origin,
        isSelected: option.default || false,
      }));

    this.dropdownItemsTwo = sortOptions
      .filter(option => option.origin === 'second')  // Filter for direction options
      .map(option => ({
        id: option.id,
        label: option.label,
        origin: option.origin,
        isSelected: option.default || false,
      }));
  }

  setSelectedCategories($event) {
    this.selectedCategories.emit({category: $event.category, subCategory: $event.subCategory});  // Set Page Number  
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
