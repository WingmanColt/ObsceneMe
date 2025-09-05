import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-multi-checkbox-dropdown',
  templateUrl: './multi-checkbox-dropdown.component.html',
  styleUrls: ['./multi-checkbox-dropdown.component.scss']
})
export class MultiCheckboxDropdownComponent implements OnChanges {
  @Input() items: any[] = [];
  @Input() buttonLabel: string = 'Select Items';
  @Input() multiSelect: boolean = true;
  @Input() selectedItems: any[] = [];
  @Input() searchQuery: string | undefined;  

  @Output() selectionChanged = new EventEmitter<any[]>();
  @Output() searchChanged = new EventEmitter<string>();  // Add this Output property

  isOpen: boolean = false;
  selectedTitles: string[] = [];
  filteredItems: any[] = [];

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItems']) {
      this.updateSelectedItems(changes['selectedItems'].currentValue);
      this.cdr.detectChanges();
    }
    if (changes['items']) {
      this.filteredItems = this.items;
    }
    if (changes['searchQuery']) {
      this.onSearch(changes['searchQuery'].currentValue);
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onItemChange(item: any): void {
    if (!item) return;

    if (this.multiSelect) {
      const index = this.selectedItems.indexOf(item);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(item);
      }
    } else {
      this.selectedItems = [item];
      this.items.forEach(i => {
        if (i && i.id !== item.id) {
          i.isSelected = false;
        }
      });
    }

    this.selectedTitles = this.selectedItems
      .filter(item => item?.isSelected)
      .map(item => item?.title);

    this.selectionChanged.emit(this.selectedItems);
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  calculateMaxHeight(): string {
    const itemHeight = 100;
    const maxItemsToShow = 10;
    const totalHeight = this.selectedTitles.length * itemHeight;
    const maxHeight = maxItemsToShow * itemHeight;

    return totalHeight > maxHeight ? maxHeight + 'px' : 'auto';
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen = false;
      this.cdr.detectChanges();
    }
  }

  private updateSelectedItems(items: any[]): void {
    if (!this.items || !Array.isArray(this.items)) 
      return;
    

    this.selectedItems = items;
    this.items.forEach(item => {
      item.isSelected = this.selectedItems.includes(item);
    });

    this.selectedTitles = this.selectedItems
      .filter(item => item?.isSelected)
      .map(item => item?.title);

    this.selectionChanged.emit(this.selectedItems);
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.filteredItems = this.items.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    this.searchChanged.emit(this.searchQuery);
  }
}
