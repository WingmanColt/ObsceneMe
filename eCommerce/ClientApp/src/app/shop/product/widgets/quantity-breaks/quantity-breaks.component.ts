import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";
import { BundleItem } from "src/app/shared/classes/bundle";
import { Product } from "src/app/shared/classes/product";

@Component({
  selector: 'app-quantity-breaks',
  templateUrl: './quantity-breaks.component.html',
  styleUrls: ['./quantity-breaks.component.scss']
})
export class QuantityBreaksComponent implements OnInit {
  @Input() baseProduct!: Product;
  @Output() bundleChanged = new EventEmitter<any>(); 
  
  env = environment;
  selectedQuantity: number | null = null;

 constructor(public baseService: BaseService) { }

  ngOnInit() {
    if (this.baseProduct.bundle?.bundleItems?.length) {
      this.baseProduct.bundle.bundleItems.forEach(item => {
        item.checked = false;
      });
    }
  }

  getBenefitLabel(price: number): string {
    const sorted = [...this.baseProduct.bundle.bundleItems]
      .sort((a, b) => a.price - b.price);

    const index = sorted.findIndex(item => item.price === price);

    if (index === 0) return 'Най-изгоден'; // Cheapest
    if (index === 1) return 'Най-поръчван'; // Second cheapest
    return '';
  }

toggleSelection(selectedItem: BundleItem) {
  const wasChecked = selectedItem.checked;

  // Uncheck all first
  this.baseProduct.bundle.bundleItems?.forEach(item => {
    item.checked = false;
  });

  // If it was not checked before → check it
  if (!wasChecked) {
    selectedItem.checked = true;
  } else {
    selectedItem.checked = false; // allow unchecking
  }

  // Shallow clone to avoid reference mutation issues
  const updatedBundleItem = { ...selectedItem };

  // Emit only once with the new state
  this.bundleChanged.emit({
    bundle: this.baseProduct.bundle,
    selectedItem: updatedBundleItem
  });

  console.log("✅ Final toggle state:", updatedBundleItem);
}

}
