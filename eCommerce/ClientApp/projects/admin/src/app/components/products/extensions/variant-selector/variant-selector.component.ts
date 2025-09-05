import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import { AdminProductsService } from 'projects/admin/src/app/services/Product/products.service';
import { Subject, takeUntil } from 'rxjs';
import { Images, VariantItem, Variants } from 'src/app/shared/classes/product';
import { GroupedVariant } from 'src/app/shared/classes/variants';

@Component({
  selector: 'app-variant-selector',
  templateUrl: './variant-selector.component.html',
  styleUrl: './variant-selector.component.scss'
})
export class VariantSelectorComponent implements OnInit, OnDestroy, OnChanges {

  @Input() variantInputs: FormArray;
  @Input() imageHolder: Images[];
  @Input() productForm: FormGroup;

  @Output() variantHolderChange = new EventEmitter<any[]>();
  @Output() imageSelectChange = new EventEmitter<{ variantIndex: number, imageId: number }>(); // New output event

    // Variants
    variantSettings = environment.pagesSettings.VariantSettings;

    Variants: any[];
    variantHolder: any[] = [];
  
    TwoDArray: VariantItem[][] = [];
    ArrayOfVariants: any[] = [];
    variantSets: Variants[][] = []; // individual sets of variants for each row
    variantCounter: number = 0;
    allVariants: any[] = [];

    selectedVariantItems: { [key: number]: VariantItem[] } = {}; // Track selected variant items for images

    private destroy$ = new Subject<void>();
    
    constructor(private fb: FormBuilder, private productService: AdminProductsService) {

      this.productForm = this.fb.group({
        variant: [null] 
      });
    }
  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {
    this.initVariants();
  }

  initVariants(): void {
    this.productService
      .GetAllVariants()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: GroupedVariant[]) => {
        this.Variants = response;
        this.allVariants = response;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  setSelectedVariants(selectedVariants: GroupedVariant[]) {

    if (selectedVariants?.length) {
      this.variantCounter = selectedVariants.length - 1;
  
      // Call increment() method for each variant to create input rows
      for (let i = 0; i < selectedVariants.length; i++) {
        this.increment();
      }
  
      selectedVariants.forEach((selectedVariant, row) => {
        // Find the matching variant from this.Variants array
        const matchingVariant = this.Variants?.find(
          (variant) => variant.id === selectedVariant.id
        );
  
        if (matchingVariant) {
          matchingVariant.isSelected = true; // Mark as selected
  
          // Now, iterate over variantItems in the matchingVariant
          matchingVariant.variantItems?.forEach((item) => {
            // Find corresponding selectedItem from selectedVariant
            const selectedItem = selectedVariant.variantItems?.find(
              (svItem) => svItem.id === item.id
            );
  
            if (selectedItem) {
              item.isSelected = true; // Mark item as selected
            }
          });
  
          // Ensure selectedVariants are part of the variantHolder
          this.variantHolder.push(JSON.parse(JSON.stringify(matchingVariant)));
  
          // Call handleSelectChange here, passing the row and selectedVariant.id
          this.handleSelectChange(row, selectedVariant.id);
        }
      });
  
      // Emit the updated variantHolder
      this.handleVariantHolderChange();
    }
  }
  
   increment() {
      if (this.Variants?.length <= this.variantInputsArray?.length) return;

      this.addInputField("variantInputs");
      this.variantCounter++;
  }

  decrement() {
   if (this.variantInputsArray?.length <= 0) return;

     const last = this.variantInputsArray?.length - 1;
     this.removeRows(last);
     this.variantCounter--;
  }

  pushOrUpdate(row: number, column: number, value: any): void {
    if (!this.TwoDArray[row]) {
      this.TwoDArray[row] = [];
    }

    const index = this.TwoDArray[row].indexOf(value);
    if (index > -1) {
      this.TwoDArray[row][index] = value;
      if (typeof value != "string") this.ArrayOfVariants[index] = value;
    } else {
      this.TwoDArray[row].push(value);
      if (typeof value != "string") this.ArrayOfVariants.push(value);
    }
  }

  handleSelectChange(row: number, value: any): void {
    this.pushOrUpdate(row, 0, value);

    // Find the selected variant based on the selected value (id)
    let selectedVariant = this.Variants?.find((v: Variants) => v.id == value);

    if (selectedVariant) {
        // Initialize this.variantSets[row] if it's not already done
        if (!this.variantSets[row]) {
            this.variantSets[row] = [];
        }

        // Remove any existing variant in this.variantSets[row] if there is one
        if (this.variantSets[row].length > 0) {
            this.variantSets[row].splice(0, 1);
        }

        // Push the selected variant into this.variantSets[row]
        this.variantSets[row].push(selectedVariant);

        // Update the isSelected state for all variants (to ensure checkboxes reflect the selection)
        this.Variants.forEach(variant => {
            // If the variant is the selected one, set isSelected to true
            variant.isSelected = (variant.id === selectedVariant.id);
        });
    }

    // Trigger Angular change detection by copying variantSets
    this.variantSets = [...this.variantSets];
}

  
  handleCheckboxChange(row: number, selectedVariantItem: VariantItem, checked: boolean): void {
    if (
      this.variantSets[row] &&
      this.variantSets[row][0] &&
      this.variantSets[row][0].variantItems
    ) {
      // Find the variant item that the user interacted with
      let variantItem = this.variantSets[row][0].variantItems.find(
        (item) => item.value === selectedVariantItem.value
      );

      if (variantItem) {
        // Update its isSelected property
        variantItem.isSelected = checked;

        // Create a copy of the variant set at the given row
        let variantSetCopy: Variants = JSON.parse(
          JSON.stringify(this.variantSets[row][0])
        );

        // Copy only VariantItem objects where isSelected is true
        variantSetCopy.variantItems = variantSetCopy.variantItems.filter(
          (item) => item.isSelected
        );

        // Find the index of the original Variants object in this.variantHolder
        const index = this.variantHolder.findIndex(
          (v) => v.id === variantSetCopy.id
        );

        if (index > -1) {
          // If it exists, update it
          this.variantHolder[index] = variantSetCopy;
        } else if (variantSetCopy.variantItems.length > 0) {
          // Otherwise, add the new Variants object to the array
          this.variantHolder.push(variantSetCopy);
        }

        // Filter out Variants objects where there are no selected VariantItem objects
        this.variantHolder = this.variantHolder.filter(
          (v) => v.variantItems.length > 0
        );
      }

      if (!this.selectedVariantItems[row]) {
        this.selectedVariantItems[row] = [];
      }

      if (checked) {
        this.selectedVariantItems[row].push(variantItem);
      } else {
        this.selectedVariantItems[row] = this.selectedVariantItems[row].filter(item => item.value !== variantItem.value);
      }

    
    }
  }

  trackByFn(index, item) {
    // Unique identifier for the item, e.g., item.id
    return item.id;
  }

  prepareForSubmit(): void {
    // Initialize/reset this.variantHolder
    this.variantHolder = [];

    // Iterate over each variantSet in this.variantSets
    this.variantSets.forEach((variantSet, i) => {
      if (variantSet && variantSet[0] && variantSet[0].variantItems) {
        let variantSetCopy: Variants = JSON.parse(
          JSON.stringify(variantSet[0])
        );

        // Filter out VariantItem objects where isSelected is false
        variantSetCopy.variantItems = variantSetCopy.variantItems.filter(
          (item) => item.isSelected
        );

        // If any VariantItem objects were selected, add the Variants object to this.variantHolder
        if (variantSetCopy.variantItems.length > 0) {
          this.variantHolder.push(variantSetCopy);
        }
      }
    });

    this.handleVariantHolderChange();
  }

  ConvertFormArrayToVariants(title: string): Variants[] {
    var variantsList: Variants[] = new Array();

    // Iterate over the array and group items based on variantId
    const variantMap = new Map<number, Variants[]>();

    this.ArrayOfVariants.forEach((item) => {
      const variantId = item.variantId;
      if (variantMap.has(variantId)) {
        variantMap.get(variantId)!.push(item);
      } else {
        variantMap.set(variantId, [item]);
      }
    });
    // Convert map values to an array of arrays
    const groupedArrays: Variants[][] = Array.from(variantMap.values());

    for (let i = 0; i < this.variantInputs?.length; i++) {
      const variant = new Variants();
      variant.variantItems = groupedArrays[i];
      variant.title = title;
      variantsList.push(variant);
    }

    return variantsList;
  }


  private addInputField(initialValue?: any): void {
      const formArray = this.productForm.get('variantInputs') as FormArray;
      formArray.push(this.createItem(initialValue));
      formArray.updateValueAndValidity();
      this.variantInputs = formArray;
    }
  
  private createItem(initialValue: any = {}) {
      return this.fb.group({
        variantId: [initialValue.variantId || '']
      });
    }
  
  private removeRows(index: number): void {
      this.variantInputs.removeAt(index);
      this.handleVariantHolderChange();
    }

  private setToLocalStorage(title: string, array: any) {
    localStorage.setItem(title, JSON.stringify(array));
  }

  private handleVariantHolderChange() {
    this.variantHolderChange.emit(this.variantHolder);
  }

  handleImageSelectChange(variantItem: any, imageId: number): void {
    const variantIndex = variantItem.id;
    this.imageSelectChange.emit({ variantIndex, imageId });
  }

  get variantInputsArray() {
    return (this.productForm.get("variantInputs") as FormArray).controls;
  }
  trackById(index: number, image: Images): number | string | undefined {
    return image.id || index;
  }
}
