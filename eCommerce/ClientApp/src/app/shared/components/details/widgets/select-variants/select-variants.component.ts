import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";
import { Images } from "src/app/shared/classes/product";
import { GroupedVariant, GroupedVariantItem } from "src/app/shared/classes/variants";

@Component({
  selector: "app-select-variants",
  templateUrl: "./select-variants.component.html",
  styleUrls: ["./select-variants.component.scss"],
})
export class SelectVariantsComponent implements OnChanges {
  imageKitUrl = environment.imageKitUrl;
  variantSettings = environment.pagesSettings.VariantSettings;

  isChartOpen = false;
  showDropdown = false;

  selectedItem: GroupedVariantItem | null = null;
  selectedVariant: { [key: string]: { key: string, item: GroupedVariantItem } } = {};

  selectedVariants: GroupedVariant[] = [];
  activeImage: string | undefined;

  @Input() productId: number | undefined;
  @Input() variants: GroupedVariant[] = [];
  @Input() thumbImages: Images[];
  @Input() viewLayout: string = '';

  @Output() chart = new EventEmitter<boolean>();
  @Output() setActiveImage = new EventEmitter<string>();

  constructor(public baseService: BaseService) {}

  ngOnChanges(): void {
    this.initializeSelectedItem();
    this.setVariantImages();
  }

  initializeSelectedItem(): void {
    if (this.variants.length) {
      const firstVariant = this.variants[0];
      const firstItem = firstVariant.variantItems?.[0];

      if (firstItem) {
        // Ensure the item is marked as selected
        firstItem.isSelected = true;

        // Update selectedVariant object
        this.selectedVariant[firstVariant.title || ''] = { key: firstVariant.title || '', item: firstItem };

        // Emit the selected item
        this.emitSelectedItem();
      }
    }
  }

  setVariantImages(): void {
    this.variants.forEach(variant => {
      variant.variantItems.forEach(item => {
        const foundImage = this.thumbImages.find(image => image.variantId === item.id);
        if (foundImage) {
          item.image = foundImage.src;
        }
      });
    });
  }

  emitSelectedItem(): void {
    if (this.selectedItem) {
      /*(this.selectedItems.emit([{
        ...this.selectedItem,
        variantItems: [this.selectedItem]
      }]);*/
    }
  }

  openChart(): void {
    this.isChartOpen = !this.isChartOpen;
    this.chart.emit(this.isChartOpen);
  }

  selectVariant(variantTitle: string, ent: GroupedVariantItem): void {
    if (!ent || !ent.value) return;

    
    ent.isSelected = !ent.isSelected;

    if (ent.isSelected) {
      this.selectedVariant[variantTitle] = { key: variantTitle, item: ent };

      this.variants.forEach(variant => {
        if (variant.title === variantTitle) {
          variant.variantItems.forEach(item => {
            if (item !== ent) item.isSelected = false;
          });
        }
      });
    } else {
      delete this.selectedVariant[variantTitle];
    }

    const selectedVariantsArray = this.variants
      .filter(variant => variant.variantItems.some(item => item.isSelected))
      .map(variant => ({
        ...variant,
        variantItems: variant.variantItems.filter(item => item.isSelected),
      }));

    
    this.SetActiveImage(selectedVariantsArray);
  }

  SetActiveImage(selectedVariantsArray): void {
    this.selectedVariants = selectedVariantsArray;
    const latestVariant = this.selectedVariants[this.selectedVariants.length - 1];
    
    if (latestVariant && latestVariant.variantItems) {
      const selectedVariantItem = latestVariant.variantItems.find(item => item.isSelected);
      if (selectedVariantItem) {
        const foundImage = this.thumbImages.find(image => image.variantId === selectedVariantItem.id);
        this.activeImage = foundImage ? foundImage.src : null;
      } else {
        this.activeImage = null;
      }

      this.setActiveImage.emit(this.activeImage);
    }
  }

  getSelectedValueTitle(title: string): { key: string; item: GroupedVariantItem } | null {
    const entry = Object.entries(this.selectedVariant).find(([key]) => key === title);
    return entry ? { key: entry[0], item: entry[1].item } : null;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  selectDropdownItem(title: string, ent: GroupedVariantItem): void {
    this.selectedItem = ent;
    this.showDropdown = false;
    this.selectVariant(title, ent);
  }

  get selectedIconUrl(): string {
    return this.selectedItem ? this.getIconUrl(this.selectedItem.value) : "";
  }

  getIconUrl(value: string): string {
    return this.variantSettings.imageIconUrl + (value.toLowerCase() || '') + (!this.variantSettings.imageIconUrlExtensionAuto ? this.variantSettings.imageIconUrlExtension : '');
  }

  get selectedImageUrl(): string {
    return this.selectedItem ? this.getImageSrc(this.selectedItem.image) : "";
  }

  getImageSrc(imageSrc: string): string {
    if (imageSrc.startsWith('https') || imageSrc.startsWith('http')) {
      return imageSrc;
    } else {
      return this.imageKitUrl + (imageSrc?.toLowerCase() || '') + ".webp";
    }
  }
}
