import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CheckboxItem } from '../../classes/dropdown';

@Component({
  selector: 'app-checkbox-list',
  templateUrl: './checkbox-list.component.html',
  styleUrls: ['./checkbox-list.component.scss']
})
export class CheckboxListComponent implements OnInit, OnChanges {
  @Input() title: string; // Title for the checkbox list
  @Input() items: CheckboxItem[] = []; // Array of items for checkboxes
  @Input() selectedItems: number[] = []; // Ensure this is always an array
  @Input() isCollapsed: boolean = true;
  @Input() isMultipleSelection: boolean = false; // Controls single or multiple selection

  @Output() updateSelection = new EventEmitter<number[] | number | null>(); // Emit selected items (array or single)

  ngOnInit(): void {
    // Initialize selected items
    this.updateCheckboxSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update selected items when input changes
    if (changes.selectedItems) {
      this.updateCheckboxSelection();
    }
  }

  // Check if item is selected
  isSelected(item: CheckboxItem): boolean {
    // Ensure selectedItems is an array even for single selection mode
    const selectedArray = Array.isArray(this.selectedItems) ? this.selectedItems : [this.selectedItems];
    return selectedArray.includes(item.id);
  }

  // Toggle selection of item
  onCheckboxChange(item: CheckboxItem): void {
    if (!item) return; // Guard clause for undefined item

    // Ensure selectedItems is initialized as an array
    if (!this.selectedItems) {
      this.selectedItems = [];
    }

    if (this.isMultipleSelection) {
      // Multiple selection mode
      if (this.isSelected(item)) {
        this.selectedItems = this.selectedItems.filter(id => id !== item.id); // Remove if already selected
      } else {
        this.selectedItems.push(item.id); // Add if not selected
      }
      this.updateSelection.emit(this.selectedItems); // Emit array of selected items
    } else {
      // Single selection mode
      this.selectedItems = this.isSelected(item) ? [] : [item.id]; // Either select or deselect the single item
      this.updateSelection.emit(this.selectedItems.length > 0 ? this.selectedItems[0] : null); // Emit single item ID or null
    }
  }

  // Update selection state based on input
  private updateCheckboxSelection(): void {
    // Optional: Additional logic for handling initial selection changes
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed; // Toggle the collapsed state
  }
}
