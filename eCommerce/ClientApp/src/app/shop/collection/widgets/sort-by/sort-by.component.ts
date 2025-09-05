import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { environment } from 'environments/environment';
import { ProductFilterService } from 'src/app/Services/Product/filters.service';

@Component({
  selector: 'app-sort-desktop',
  templateUrl: './sort-by.component.html',
  styleUrl: './sort-by.component.scss'
})

export class SortByComponent implements OnInit, OnDestroy {
  sortOptions = environment.pagesSettings.CollectionSettings.sortOptions;
  sortToggle: boolean = false;

  selectedSortItem = this.sortOptions.find(option => option.origin === 'first' && option.default);
  selectedDirectionItem = this.sortOptions.find(option => option.origin === 'second' && option.default);

  constructor(
    private renderer: Renderer2, 
    private filterService: ProductFilterService,
    private elementRef: ElementRef) { }


  ngOnInit(): void {
    const defaultSortOption = this.sortOptions.find(option => option.default === true);
    
    if (defaultSortOption) 
      this.selectedSortItem = defaultSortOption;
  }



  onSortChange(option) {
    if (option.origin === 'first') {
      this.selectedSortItem = option;
      this.filterService.updateFilter('sortBy', option.id);
    } else if (option.origin === 'second') {
      this.selectedDirectionItem = option;
      this.filterService.updateFilter('sortDirection', option.id);
    }

    this.closeToggle();
  }

  onToggle() {
    this.sortToggle = !this.sortToggle;

      if (this.sortToggle) {
        this.attachOutsideClickListener();
      } else {
        this.removeOutsideClickListener();
      }
  
  }

  private outsideClickListener: () => void;
  private attachOutsideClickListener() {
    this.outsideClickListener = this.renderer.listen('document', 'click', (event) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.closeToggle();
      }
    });
  }

  private removeOutsideClickListener() {
    if (this.outsideClickListener) 
      this.outsideClickListener(); // Remove the listener
  }

  private closeToggle() {
    this.sortToggle = false;
    this.removeOutsideClickListener(); // Ensure to remove the listener when the toggle is closed
  }

  ngOnDestroy(): void {
    this.sortToggle = false;
    this.removeOutsideClickListener(); // Ensure to remove the listener when the toggle is closed
  }
}
