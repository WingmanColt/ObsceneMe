import { Component, EventEmitter, Input, OnInit, Output, HostListener, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { DropdownItem } from '../../classes/dropdown';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.scss']
})
export class CustomDropdownComponent implements OnInit, OnChanges {
  @Input() dropdownArray: DropdownItem[] = [];
  @Input() dropdownArrayTwo: DropdownItem[] = []; // Optional second array
  @Input() iconUrl: string = '';
  @Input() iconExt: string = '';
  @Input() defaultValue: string = '';
  @Input() openDirectionBottom: boolean = true;
  @Input() multipleSelection: boolean = false; // Allow multiple selections by default
  @Input() selectedValue: string = ''; // expect the label string to select

  @Output() selectedValues = new EventEmitter<DropdownItem[]>(); // Emits an array of selected values

  showDropdown: boolean = false;
  selectedItems: DropdownItem[] = []; // Store selected items

  constructor(private translateService: TranslateService, private el: ElementRef) {}

  ngOnInit(): void {
    // Initialize selected items based on the default value or mark them unselected
    this.initializeSelection(this.dropdownArray);
    this.initializeSelection(this.dropdownArrayTwo);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedValue'] && this.selectedValue) {
      this.selectByLabel(this.selectedValue);
    }
  }
    private selectByLabel(label: string) {
    this.dropdownArray.forEach(item => {
      item.isSelected = item.label === label;
    });
    this.selectedItems = this.dropdownArray.filter(item => item.isSelected);
  }
  // Initialize selection for each array
  private initializeSelection(array: DropdownItem[]) {
    array.forEach((arr: DropdownItem) => {
      if (arr.label === this.defaultValue) {
        arr.isSelected = true;
        this.selectedItems.push(arr);
      } else {
        arr.isSelected = false;
      }
    });

    // If there's only one item, select it automatically
    if (array.length === 1 && !this.selectedItems.includes(array[0])) {
      array[0].isSelected = true;
      this.selectedItems.push(array[0]);
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // Method to handle selecting/deselecting items
  selectItem(ent: DropdownItem, isFromFirstArray: boolean) {
    if (this.multipleSelection) {
      ent.isSelected = !ent.isSelected; // Toggle selection

      if (ent.isSelected) {
        this.selectedItems.push(ent); // Add to selected items
      } else {
        this.selectedItems = this.selectedItems.filter(item => item !== ent); // Remove if unchecked
      }
    } else {
      // When 1 array is exists
      if (ent.isSelected) {

        ent.isSelected = false;
        this.selectedItems = this.selectedItems.filter(item => item !== ent);
      } else {

      // When both arrays has values for selecting
        if (isFromFirstArray) {
          this.dropdownArray.forEach(item => (item.isSelected = false));
        } else {
          this.dropdownArrayTwo.forEach(item => (item.isSelected = false));
        }

        ent.isSelected = true;

        this.selectedItems = [
          ...this.dropdownArray.filter(item => item.isSelected),
          ...this.dropdownArrayTwo.filter(item => item.isSelected),
        ];
      }
    }

    const selectedWithAllProperties = this.selectedItems.map(item => ({
      ...item, // Spread the item to include all properties
    }));

    this.selectedValues.emit(selectedWithAllProperties); // Emit selected values with all properties

    if(!this.multipleSelection)
    this.showDropdown = !this.showDropdown;
  }

  getIconUrl(value: string): string {
    if (!value) return '';

    // If the image is a full URL, use it as-is
    if (value.startsWith('http')) {
      return value;
    }

    // Otherwise, build the local image path
    return this.iconUrl + value.toLowerCase() + this.iconExt;
  }


  get selectedIconUrl() {
    return this.selectedItems.length > 0 ? this.getIconUrl(this.selectedItems[0].image) : '';
  }

  // Method to generate the selected labels
  getSelectedLabels(): string {
    if (this.selectedItems.length > 0) {
      const translatedLabels = this.selectedItems.map(item => this.translateService.instant(item.label));
      return translatedLabels.join(', ');
    }
    return this.translateService.instant('Select Option');
  }

  // Close the dropdown if clicking outside of it
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.el.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showDropdown = false; // Close the dropdown
    }
  }
}
