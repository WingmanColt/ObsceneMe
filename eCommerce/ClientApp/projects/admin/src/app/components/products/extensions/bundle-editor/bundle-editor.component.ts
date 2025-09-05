import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ProductById } from 'projects/admin/src/app/services/Product/classes/Product';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { BundleInput, BundleType } from 'src/app/shared/classes/bundle';
import { Status } from 'src/app/shared/classes/enums/approveType';
import { Product2 } from 'src/app/shared/classes/products/products';

@Component({
  selector: 'app-bundle-editor',
  templateUrl: './bundle-editor.component.html',
  styleUrls: ['./bundle-editor.component.scss']
})
export class BundleEditorComponent implements OnInit, OnChanges {
  @Input() product: any | null = null;
  @Output() bundleCreated = new EventEmitter<BundleInput>();

  form!: FormGroup;
  isBundleActive = false;

  productOptions: Product2[] = [];

  statusList = Object.entries(Status)
    .filter(([_, val]) => typeof val === 'number')
    .map(([key, val]) => ({ key, val })) as { key: string; val: number }[];

  bundleTypeList = Object.entries(BundleType)
  .filter(([_, val]) => typeof val === 'number')
  .map(([key, val]) => ({ key, val })) as { key: string; val: number }[];

  loading = true; // Controls UI rendering until data ready

  constructor(
    private fb: FormBuilder,
    private productService: ProductsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.initForm();
    console.log(this.product);
    this.productOptions = await this.productService.getProductsAsync() || [];

    if(this.productOptions)
        this.loading = false;
  }

ngOnChanges(changes: SimpleChanges) {
  if (changes['product']) {
    console.log('product changed:', this.product);
    if (this.product) {
      this.patchFormWithProduct(this.product);
    }
  }
}

  initForm() {
    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [false],
      status: [Status.Available, Validators.required],
      type: [BundleType.QuantityBreak, Validators.required],
      bundleQuantity: [1, [Validators.required, Validators.min(1)]],
      bundleItems: this.fb.array([])
    });

    this.form.get('bundleQuantity')!.valueChanges.subscribe(count => {
      if (count && count > 0) {
        this.setBundleItemsCount(count);
      }
    });
  }

  patchFormWithProduct(product: ProductById) {
    if (!product.bundle) {
      this.loading = false;
      return;
    }

    const b = product.bundle;
    this.isBundleActive = b.isActive;

    this.form.patchValue({
      id: b.id,
      name: b.name,
      description: b.description,
      isActive: b.isActive,
      status: b.status,
      type: b.type,
      bundleQuantity: b.bundleItems?.length || 1
    });

    this.setBundleItemsCount(b.bundleItems?.length || 1);

    b.bundleItems?.forEach((item, i) => {
      const itemGroup = this.bundleItems.at(i);
      if (itemGroup) {
        itemGroup.patchValue({
          title: item.title,
          price: item.price,
          discountRate: item.discountRate,
          quantity: item.quantity,
          imageSrc: item.imageSrc,
          productId: item.productId,
          bundleId: item.bundleId,
          id: item.id
        });
      }
    });

    this.loading = false;
  }

  get bundleItems(): FormArray {
    return this.form.get('bundleItems') as FormArray;
  }

  createBundleItemFormGroup(): FormGroup {
    return this.fb.group({
      id: [0],
      title: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      discountRate: [0, [Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      imageSrc: [''],
      productId: [0],
      bundleId: [0]
    });
  }

  setBundleItemsCount(count: number): void {
    const items = this.bundleItems;
    while (items.length < count) {
      items.push(this.createBundleItemFormGroup());
    }
    while (items.length > count) {
      items.removeAt(items.length - 1);
    }
  }

  removeBundleItem(index: number): void {
    this.bundleItems.removeAt(index);
  }

  onIsActiveChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isBundleActive = checked;
    this.form.get('isActive')!.setValue(checked);
  }

  onProductSelected(value: any, index: number): void {
    const productId = +value; // convert string to number
    const selected = this.productOptions.find(p => p.id === productId);
    if (!selected) return;

    const itemGroup = this.bundleItems.at(index);
    itemGroup.patchValue({
      title: selected.title,
      price: selected.price,
      discountRate: selected.discountRate || 0,
      imageSrc: selected.image,
      productId: selected.id
    });
  }
  
  getPayload(): BundleInput {
    const formValue = this.form.value;
    return {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description,
      isActive: this.isBundleActive,
      status: formValue.status,
      type: formValue.type,
      bundleItems: formValue.bundleItems
    };
  }

  submitBundle(): void {
    if (this.form.valid && this.isBundleActive) {
      const payload = this.getPayload();
      this.bundleCreated.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
