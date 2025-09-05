import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import { Images, ImageType, ImageType_LabelMapping } from 'src/app/shared/classes/product';
import { Operations } from 'src/app/shared/classes/enums/operations';
import { ImageUploadService } from 'projects/admin/src/app/services/image-upload.service';
import { Trademarks_LabelMapping } from 'src/app/shared/classes/enums/trademarks';
import { AdminProductsService } from 'projects/admin/src/app/services/Product/products.service';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit, OnDestroy {

  @Input() product: any;
  @Input() imageInputs: FormArray;
  @Input() productForm: FormGroup;
  @Input() operation: Operations;
  @Output() imageHolderChange = new EventEmitter<Images[]>();

  Images: Images[] = [];
  mainImage: Images = {};
  imagesCounter = 1;
  imageHolder: Images[] = [];
  placeHolder = environment.placeholderSrc;

  public trademarkLabelMapping = Trademarks_LabelMapping;
  public imageTypeLabelMapping = ImageType_LabelMapping;
  public imageTypes = Object.values(ImageType).filter((value) => typeof value === "number"); // for nums .filter(value => typeof value === 'number');

  constructor(
     private fb: FormBuilder, 
     public productService: AdminProductsService,
     public imageUploadService: ImageUploadService) {}

  ngOnInit(): void {
   // this.retrieveImageStorage();
  }

  ngOnDestroy(): void {
    this.resetComponentState();
  }

  private resetComponentState(): void {
    this.imageInputs = undefined;
    this.productForm = undefined;
    this.Images = undefined;
    this.imageHolder = undefined;
    this.imagesCounter = 1;
    this.mainImage = undefined;
  }

  private retrieveImageStorage(): void {
    const imagesItem = JSON.parse(localStorage.getItem('imagesItem') || '[]');

    if (Array.isArray(imagesItem) && imagesItem.length > 0) {
      this.setImages(imagesItem);
    }
  }

  public setImages(value: Images[] | undefined): void {
    if (value?.length) {
      this.imageHolder = [...value];
      this.setMainImageFromHolder();
      this.prepareImagesForForm();
      this.imagesCounter = this.imageHolder.length;
    } else {
      this.clearImages();
    }
    this.emitImageHolderChange();
  }

  private setMainImageFromHolder(): void {
    const mainImage = this.imageHolder.find(img => img.imageType == 1) || this.imageHolder[0];
    if (mainImage) {
      mainImage.imageType = 1;
      this.mainImage = { ...mainImage };
    }
  }

  private prepareImagesForForm(): void {
    this.imageHolder.forEach((image, index) => {
      image.Operation = this.operation;
      this.addInputField({ image: image.src, isExternal: image.isExternal, variantId: image.variantId});
      if (index === 0 && image.imageType == 0) {
        image.imageType = 1;
      }
    });
  }

private clearImages(): void {
  this.imageHolder = [];
  this.mainImage = {};
  this.imagesCounter = 0;
  this.emitImageHolderChange(); // 🔧 added
}

  addInputField(initialValue?: any): void {
    const formArray = this.productForm.get('imageInputs') as FormArray;
    formArray.push(this.createItem(initialValue));
    formArray.updateValueAndValidity();
    this.imageInputs = formArray;
  }

  private createItem(initialValue: any = {}): FormGroup {
    return this.fb.group({
      variantId: [initialValue.variantId || ''],
      image: [initialValue.image || ''],
    });
  }

  removeRows(index: number): void {
    this.imageInputs.removeAt(index);
    this.imageHolder.splice(index, 1);

    this.updateLocalStorage();
    this.emitImageHolderChange();
  }

  private updateLocalStorage(): void {
    localStorage.setItem('imagesItem', JSON.stringify(this.imageHolder));
  }

  increment(): void {
    this.imageHolder.push(new Images(this.operation));
    this.addInputField();
    this.imagesCounter++;
    this.updateMainImage(0);
    this.emitImageHolderChange();
  }

  decrement(): void {
    if (this.imagesCounter < 1) return;
    this.removeRows(this.imageInputs.length - 1);
    this.imageHolder.pop();
    this.imagesCounter--;
    this.updateMainImage(0);
    this.emitImageHolderChange();
  }

  setExternal(item: Images, index: number): void {
    item.isExternal = !item.isExternal;
    if (!item.isExternal) {
      this.imageHolder[index].src = null;
      this.productForm.get(`imageInputs.${index}.image`).setValue(null);
    }
    if (index === 0) {
      this.updateMainImage(index);
    }
    this.emitImageHolderChange();
  }

updateImageSrc(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  const newImage = input.value;

  if (this.imageHolder[index]) {
    this.imageHolder[index].src = newImage;
    this.imageHolder[index].Operation = this.operation;
  } else {
    this.imageHolder.push({
      src: newImage,
      Operation: this.operation,
    });
  }

  this.productForm.get(`imageInputs.${index}.image`).setValue(newImage);

  if (index === 0) {
    this.updateMainImage(index);
  }

  // Don't call prepareImagesForForm() here again — it's already done during init
  this.imagesCounter = this.imageHolder.length;

  this.emitImageHolderChange(); // ✅ consistent emission
}

  
  private updateMainImage(index: number): void {
    if (this.imageHolder.length > 0) {
      const mainImage = this.imageHolder[index];
      mainImage.imageType = 1;
      this.mainImage.src = mainImage.src || '';
      this.mainImage.productId = mainImage.productId || undefined;
      this.imageHolder.forEach((img, i) => {
        if (i !== index) {
          img.imageType = 0;
        }
      });
    } else {
      this.mainImage = {};
    }
  }

  handleFileInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageHolder[index] = {
          ...this.imageHolder[index],
          src: e.target.result,
          Operation: this.operation 
        };
        this.productForm.get(`imageInputs.${index}.image`).setValue(e.target.result);
        if (index === 0) {
          this.mainImage = e.target.result;
          this.imageHolder[index].imageType = 1;
        }
        this.emitImageHolderChange();
      };

      reader.readAsDataURL(file);
    }
  }

  onImageUpload(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const newImage: Images = {
          src: e.target.result,
          Operation: this.operation 
        };

        this.imageHolder.push({ ...newImage });

        if (this.imageHolder.length === 1) {
          this.mainImage = { ...this.imageHolder[0], imageType: 1 };
        }

        this.imagesCounter = this.imageHolder.length;
        this.productForm.patchValue({ imageInputs: this.imageHolder });
        this.emitImageHolderChange();
      };

      reader.readAsDataURL(file);
    }
  }

  readUrl(event: any, i: number): void {
    const input = event.target as HTMLInputElement;
    if (this.imageHolder[i].isExternal) {
      this.imageHolder[i].src = input.value;
      this.imageHolder[i].Operation = this.operation;
    } else {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageHolder[i].src = e.target.result;
          this.imageHolder[i].Operation = this.operation;
          this.productForm.get(`imageInputs.${i}.image`).setValue(e.target.result);
          if (i === 0) {
            this.mainImage = { ...this.imageHolder[0], imageType: 1 };
          }
          this.emitImageHolderChange();
        };
        reader.readAsDataURL(input.files[0]);
      }
    }
  }

  private emitImageHolderChange(): void {
    this.imageHolderChange.emit(this.imageHolder);
  }
  
  private updateImageHolderAndEmit(callback: () => void): void {
  callback();
  this.emitImageHolderChange();
}
  
  trackById(index: number, image: Images): number | string | undefined {
    return image.id || index;
  }
}
