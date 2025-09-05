import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from "environments/environment";
import { Observable, Subscription, tap } from "rxjs";
import { ProductsService } from "src/app/Services/Product/products.service";
import { SubscriptionTrackerService } from "src/app/Services/Tracker/subscription-tracker.service";
import { FilterVariants, SelectedFilterArray, VariantItem, Variants } from "src/app/shared/classes/product";

@Component({
 selector: "app-filter-variants",
 templateUrl: "./variants.component.html",
 styleUrls: ["./variants.component.scss"],
})
export class FilterVariantsComponent implements OnInit, OnDestroy {
 componentName: string = "FilterVariantsComponent";
 collapse: boolean[] = [];
 variants$: Observable<FilterVariants[]>;
 selectedVariants: SelectedFilterArray[] = [];

 g_RouteSubs: Subscription | undefined;
 variantSettings = environment.pagesSettings.VariantSettings;

 @Output() filterEvent = new EventEmitter<any>();

 constructor(private activatedRoute: ActivatedRoute, public productService: ProductsService, private subTracker: SubscriptionTrackerService) {}

 ngOnInit(): void {
  this.variants$ = this.productService.filterVariants$;

  // Get Query params..
  const subRouter = this.activatedRoute.queryParams.subscribe((params) => {
   // Reset selectedVariants before setting new values
   this.selectedVariants = [];

   if (params.variants) {
    let variantsArray = decodeURIComponent(params.variants).split(";");
    this.selectedVariants = variantsArray.map((variantStr) => {
     let [title, values] = variantStr.split(":");
     return {
      title: decodeURIComponent(title),
      values: decodeURIComponent(values).split(","),
     };
    });

    // Filter out any "empty" variants, i.e., variants with no values
    this.selectedVariants = this.selectedVariants.filter((v) => v.title && v.values.length > 0);
   }

   // Reset all checkboxes to unchecked
   this.variants$ = this.productService.filterVariants$.pipe(
    tap((variantsArray) => {
     // Create an array for managing the collapse state of each variant
     this.collapse = Array(variantsArray.length).fill(false);

     // Iterate over each variant in the array
     variantsArray.forEach((variant: Variants, index) => {
      // Iterate over each variantItem in the variant
      variant.variantItems.forEach((variantItem: VariantItem) => {
       // Assume item is not selected initially
       variantItem.isSelected = false;

       if (variant.title === "Taste") variantItem.image = this.variantSettings.imageIconUrl + variantItem.value?.toLowerCase() + this.variantSettings.imageIconUrlExtension;

       // Use some() instead of find() to break when a match is found
       // It returns true if any element satisfies the provided testing function
       const hasMatchingVariant = this.selectedVariants.some((selectedVariant) => selectedVariant.title === variant.title && selectedVariant.values.includes(variantItem.value));

       // If there's a selected variant that matches this one, mark it as selected
       if (hasMatchingVariant) {
        variantItem.isSelected = true;

        // If variantItem is selected, set the corresponding collapse to true
        this.collapse[index] = true;
       }
      });
     });
    })
   );
  });

  this.subTracker.track({
   subscription: subRouter,
   name: "subRouter",
   fileName: this.componentName,
  });
 }
 ngOnDestroy(): void {
  this.subTracker.releaseAllForComponent(this.componentName);
 }

 onCheckboxChange($event: any, variant: Variants, variantItem: VariantItem) {
  variantItem.isSelected = !variantItem.isSelected;

  // Find existing variant in the selected variants
  let existingVariant = this.selectedVariants.find((v) => v.title === variant.title);

  if ($event.target.checked) {
   if (existingVariant) {
    // If a variant with the same title already exists, push the value into its array
    existingVariant.values.push(variantItem.value);
   } else {
    // Otherwise, add a new variant
    this.selectedVariants.push({ title: variant.title, values: [variantItem.value] });
   }
  } else {
   if (existingVariant) {
    // Check if the variant with the same title exists in the array before removing the value
    const index = existingVariant.values.indexOf(variantItem.value);

    if (index !== -1) {
     existingVariant.values.splice(index, 1); // Remove the unchecked value

     if (existingVariant.values.length === 0) {
      // If there are no more values in the variant, remove it from selectedVariants
      const variantIndex = this.selectedVariants.indexOf(existingVariant);

      if (variantIndex !== -1) {
       this.selectedVariants.splice(variantIndex, 1);
      }
     }
    }
   }
  }

  // Filter out any "empty" variants, i.e., variants with no values
  this.selectedVariants = this.selectedVariants.filter((v) => v.title && v.values.length > 0);

  // Emit the updated variants
  this.filterEvent.emit(this.selectedVariants);
 }
}
