import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent implements OnChanges {
  @Input() items: any[] = [];
  @Input() buttonLabel: string = 'Select Items';
  @Input() multiSelect: boolean = true;
  @Input() selectedItems: any[] = [];
  @Input() searchQuery: string | undefined;
  @Input() searchBar: boolean = true;

  @Output() selectionChanged = new EventEmitter<any[]>();
  @Output() searchChanged = new EventEmitter<string>(); // Search event emitter

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

  onItemSelect(item: any): void {
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
      this.items.forEach(i => i.isSelected = i === item);
    }

    this.updateSelectedTitles();
    this.selectionChanged.emit(this.selectedItems);
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  updateSelectedTitles() {
    this.selectedTitles = this.selectedItems.map(item => item?.title || '');
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
    this.selectedItems = items || [];
    this.updateSelectedTitles();
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.filteredItems = this.items.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    this.searchChanged.emit(this.searchQuery);
  }
  calculateMaxHeight(): string {
    const itemHeight = 40; // Adjust to your item height
    const maxItemsToShow = 10;
    const maxHeight = maxItemsToShow * itemHeight;
  
    const dropdownElement = this.elementRef.nativeElement.querySelector('.dropdown-content');
    const dropdownRect = dropdownElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - dropdownRect.top;
  
    // Ensure the dropdown doesn’t exceed the viewport height
    return spaceBelow < maxHeight ? spaceBelow + 'px' : maxHeight + 'px';
  }
  
}
