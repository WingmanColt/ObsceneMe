export interface DropdownItem {
 id: any;
 label: string;
 image?: string;
 icon?: string;
 badge?: string;
 isSelected?: boolean;
 origin?: 'first' | 'second'; // Add origin property
}

export interface CheckboxItem {
 id: number;       // Unique identifier for the item
 label: string;    // Display label for the checkbox
}
