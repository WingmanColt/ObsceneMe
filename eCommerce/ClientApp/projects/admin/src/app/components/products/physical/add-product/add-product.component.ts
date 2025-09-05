import { AfterViewInit, Component, OnDestroy, OnInit, SecurityContext, ViewChild } from "@angular/core";
import { Validators, FormArray, FormGroup, FormBuilder } from "@angular/forms";
import { AddProduct, ProductById } from "../../../../services/Product/classes/Product";
import {Images, LocalStorageProduct, MarketStatus, Product } from "src/app/shared/classes/product";
import { Category, Occasion, SubCategory } from "src/app/shared/classes/categories";
import { Brand, Series, SubBrand } from "src/app/shared/classes/brands";
import { Subject, takeUntil } from "rxjs";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { MultiCheckboxDropdownComponent } from "../../../multi-checkbox-dropdown/multi-checkbox-dropdown.component";
import { ItemType_LabelMapping, ItemType, Gender_LabelMapping, Gender, MarketStatus_LabelMapping, Status } from "projects/admin/src/app/classes/product";
import { ApproveType } from "src/app/shared/classes/enums/approveType";
import { VariantSelectorComponent } from "../../extensions/variant-selector/variant-selector.component";
import { ImageUploaderComponent } from "../../extensions/image-uploader/image-uploader.component";
import { Operations } from "src/app/shared/classes/enums/operations";
import { ActionsService } from "src/app/Services/Product/actions.service";
import { ActivatedRoute } from "@angular/router";
import { environment } from "environments/environment";
import { Trademarks, Trademarks_LabelMapping } from "src/app/shared/classes/enums/trademarks";
import { ConfigService } from "src/app/Services/config.service";
import { StoryPage } from "src/app/shared/classes/products/storyBlock";
import { AdminProductsService } from "projects/admin/src/app/services/Product/products.service";
import { BundleInput } from "src/app/shared/classes/bundle";
import { slugify } from "src/app/utils/slugify.util";

@Component({
  selector: "app-add-product",
  templateUrl: "./add-product.component.html",
  styleUrls: ["./add-product.component.scss"],
})

export class AddProductComponent implements OnInit, OnDestroy, AfterViewInit {
  env = environment;

  // Settings
  multiSelectCategory = false;
  multiSelectSubCategory = false;

  multiSelectBrands = false;
  multiSelectBrandSeries = false;
  multiSelectSubBrands = false;

  private destroy$ = new Subject<void>();
  private controlsToSave = [
    "title",
    "description",
    "details",
    "videoUrl",
    "quantity",
    "price",
    "discountRate",
    "gender",
    "marketStatus",
    "trademark"
  ]; // Add your control names here

  productId: number | undefined;
  product: AddProduct | undefined;
  productById: ProductById | undefined;
  quantity: number = 1;

  imageInputs: FormArray;
  imageHolder: Images[] = [];
  imageHolderBuffer: Images[] = [];

  variantInputs: FormArray;
  variantHolder: any[] = [];

  operation: Operations = Operations.Create;
  ProductLocalStorage: LocalStorageProduct[] = [];

  categories: Category[];
  subCategories: SubCategory[];
  subCategoryOptions: SubCategory[] = []; // Initialize an empty array

  brands: Brand[];

  brandSeries: Series[];
  brandSeriesOptions: Series[] = []; // Initialize an empty array

  subBrands: SubBrand[];
  subBrandsOptions: SubBrand[] = []; // Initialize an empty array

  occasions: Occasion[];
 
  // Relations
  selectedCategoryItems: any[] = [];
  searchCategoryQuery: string = ''; // pass category name to find from selectlist

  selectedSubCategoryItems: any[] = [];
  searchSubCategoryQuery: string = '';  // pass subcategory name to find from selectlist

  selectedBrandItems: any[] = [];
  searchBrandQuery: string = '';  // pass subcategory name to find from selectlist

  selectedBrandSeriesItems: any[] = [];
  searchBrandSeriesQuery: string = '';  // pass subcategory name to find from selectlist

  selectedSubBrandItems: any[] = [];
  searchSubBrandsQuery: string = '';  // pass subcategory name to find from selectlist

  selectedBundleItems: any[] = [];
  selectedOccasionItems: any[] = [];

  // FormControl
  productForm: FormGroup;
  formErrors: string[] = [];

  // Enums
  public itemTypeLabelMapping = ItemType_LabelMapping;
  public itemTypes = Object.values(ItemType); // for nums .filter(value => typeof value === 'number');

  public genderLabelMapping = Gender_LabelMapping;
  public genders = Object.values(Gender).filter((value) => typeof value === "number");

  public marketStatusLabelMapping = MarketStatus_LabelMapping;
  public marketStatus = Object.values(MarketStatus).filter((value) => typeof value === "number");

  public trademarkLabelMapping = Trademarks_LabelMapping;
  public trademarks = Object.values(Trademarks).filter((value) => typeof value === "number");

  categoriesActive: boolean;
  occasionActive: boolean;
  brandActive: boolean;
  trademarkActive: boolean;
  variantActive: boolean;
  genderActive: boolean;
  
  storyPage: StoryPage | null = null;
  bundleInput: BundleInput | null = null;
  
  @ViewChild(MultiCheckboxDropdownComponent) multiCheckboxDropdownComponent: MultiCheckboxDropdownComponent;
  @ViewChild(VariantSelectorComponent) variantSelectorComponent: VariantSelectorComponent;
  @ViewChild(ImageUploaderComponent) imageUploaderComponent: ImageUploaderComponent;

  constructor(
    private configService: ConfigService,
    private route: ActivatedRoute,
    private fb: FormBuilder, 
    private productService: AdminProductsService, 
    private actionService: ActionsService,
    private sanitizer: DomSanitizer) { 

    this.categoriesActive = this.configService.getSetting('CategoriesActive');
    this.occasionActive = this.configService.getSetting('OccasionActive');
    this.brandActive = this.configService.getSetting('BrandActive');
    this.trademarkActive = this.configService.getSetting('TrademarkActive');
    this.variantActive = this.configService.getSetting('VariantActive');
    this.genderActive = this.configService.getSetting('GenderActive');
    }

    async ngOnInit(): Promise<void> {
      // Initialize additional data (ensure this is synchronous or properly handled as async)
      this.initializeData();

      try {
         // Initialize the form
         this.initForm();
        
        // Check for productId in the route parameters
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(async params => {
          // Retrieve and convert the productId from the route parameters
          const productId = +params['id'];
          this.productId = productId;

          if (productId > 0) {
            this.operation = Operations.Update;
            await this.fetchProductDetails(productId);
          } 
          else {
            this.productId = undefined;
            this.retriveRelationStorage();
            this.populateFormFromLocalStorage();
          }
        });
    
       
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    }
    
  
  ngAfterViewInit(): void {
    // Ensure the component is initialized before interacting with it
    if (this.multiCheckboxDropdownComponent) {
    //  this.retriveRelationStorage();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(5)]],
      details: [""],
  
      videoUrl: [""],
      quantity: [this.quantity, [Validators.required]],
  
      price: [0, [Validators.required]],
      discountRate: 0,
  
      isShippable: true,
      pickupInStore: false,
      isReturnRequestAllowed: true,
  
      gender: [
        this.genderActive ? Gender.None : { value: Gender.None, disabled: true },
      ],
      status: [Status.Available],
      approveType: [ApproveType.Success],
      itemType: [ItemType.Physical],
      marketStatus: [MarketStatus.New],
      trademark: [
        this.trademarkActive
          ? Trademarks.NONE
          : { value: Trademarks.NONE, disabled: true },
      ],
  
      image: [""],
      groupedVariants: [this.variantActive ? "" : { value: "", disabled: true }],
      variant: [this.variantActive ? "" : { value: "", disabled: true }], 
  
      mockProductsCount: 0,
  
      editorContent: ["", [Validators.required, Validators.minLength(30)]],
      editorContentUsage: [""],
      editorContentComposition: [""],
      editorContentCharacteristic: [""],
  
      imageInputs: this.fb.array([]),
      variantInputs: this.fb.array([]),
  
      category: [
        this.categoriesActive ? "" : { value: "", disabled: true },
      ],
      occasion: [
        this.occasionActive ? "" : { value: "", disabled: true },
      ],
      brand: [
        this.brandActive ? "" : { value: "", disabled: true },
      ],
    });
  }
  

  private async fetchProductDetails(productId: number): Promise<void> {
    try {
      const product = await this.actionService.getProductById(productId);
      this.setValuesOnUpdate(product);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  }
  

  async populateFormFromLocalStorage(): Promise<void> {
    try {
    const storedData = localStorage.getItem("productItem");
    if (storedData) {
      const parsedData = JSON.parse(storedData);

      // Update the form values. This won't throw an error if some keys are missing in parsedData.
      this.productForm.patchValue(parsedData);
      this.quantity = parsedData.quantity;
    }
  }
  catch (error) {
    console.error('Error populating form from local storage:', error);
  }
  }

  async initializeData(): Promise<void> {
    try {
       // Initialize categories if active
       if (this.categoriesActive) {
        this.productService
          .GetAllCategories()
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.categories = res;
          });

        this.productService
          .GetAllSubCategories()
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.subCategories = res;
          });
      }
  
      // Initialize occasions if active
      if (this.occasionActive) {
        this.productService
          .GetAllOccasions()
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.occasions = res;
          });
      }

      // Initialize brands if active
      if (this.brandActive) {
        this.productService
        .GetAllBrands()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          this.brands = res;
        });

        this.productService
          .GetAllBrandSeries()
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.brandSeries = res;
          });

          this.productService
          .GetAllSubBrands()
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            this.subBrands = res;
          });
      }

  } catch (error) {
    console.error('Error initializing data:', error);
  }
  }

  // Counters
  quantityIncrement() {
    this.quantity += 1;
    this.productForm.controls["quantity"].setValue(this.quantity);
  }

  quantityDecrement() {
    if (this.quantity < 1) return;

    this.quantity--;
    this.productForm.controls["quantity"].setValue(this.quantity);
  }



  onImageSelectChange(event: { variantIndex: number; imageId: number }): void {
    const { variantIndex, imageId } = event;
  
    // Log the event data
    console.log('Event Data:', variantIndex, imageId);
  
    // Ensure that variantIndex and imageId are valid
    if (variantIndex === undefined || variantIndex === null) {
      console.log('Error: variantIndex is not defined or is null');
      return; // Stop if variantIndex is invalid
    }
  
    if (imageId === undefined || imageId === null) {
      console.log('Error: imageId is not defined or is null');
      return; // Stop if imageId is invalid
    }
  
    console.log('Valid variantIndex:', variantIndex, 'Valid imageId:', imageId);
  
    // Log the types of imageId and the image ids in imageHolder
    console.log('imageId type:', typeof imageId);
    console.log('imageHolder ids:', this.imageHolder.map(image => image.id));
  
    // Find the image with the given variantIndex
    const previousImageIndex = this.imageHolder.findIndex(
      image => image.variantId === variantIndex && image.id !== imageId
    );
  
    // If an image with the same variantIndex exists, reset its variantId
    if (previousImageIndex !== -1) {
      console.log('Clearing variantId of previous image with id:', this.imageHolder[previousImageIndex].id);
      this.imageHolder[previousImageIndex].variantId = 0;
    }
  
    // Find the new image to update
    const imageIndex = this.imageHolder.findIndex(image => Number(image.id) === Number(imageId));
  
    if (imageIndex !== -1) {
      console.log('Updating image with id:', imageId);
  
      // Update the image's variantId with the new variantIndex
      this.imageHolder[imageIndex] = {
        ...this.imageHolder[imageIndex],
        variantId: variantIndex, // Set the variantId for the new selected image
      };
  
      console.log('Updated Image Holder:', this.imageHolder);
    } else {
      console.log('Error: Image with id', imageId, 'not found in imageHolder');
    }
  }
  
  
  onImageHolderChange(imageHolder: Images[]): void {
    console.log(imageHolder)
      if (this.productForm) {
      this.productForm.patchValue({ image: imageHolder });
    } else {
      console.error('productForm is not initialized!');
    }
  }
  
    
   onVariantHolderChange(variantHolder: any[]): void {
      this.variantHolder = variantHolder;
      this.productForm.patchValue({ groupedVariants: variantHolder });
    }

  onEditorFormChange(updatedForm: any): void {
    this.productForm = updatedForm;
  }

private collectFormErrors(): string[] {
  const errors: string[] = [];
  Object.keys(this.productForm.controls).forEach(key => {
    const controlErrors = this.productForm.get(key)?.errors;
    if (controlErrors) {
      Object.keys(controlErrors).forEach(errorKey => {
        errors.push(`${key} - ${errorKey}`);
      });
    }
  });
  return errors;
}

async onSubmit(): Promise<void> {
  const body: AddProduct = this.productForm.value;
  const formErrors = this.collectFormErrors();

  body.shortName = slugify(body.title);
  // Extract storyPage from internal data
  body.storyPage = this.storyPage;

  // Add all required data (before validation)
  body.description = this.sanitizeAndCheckEmpty(this.productForm.get('editorContent')?.value);
  body.usage = this.sanitizeAndCheckEmpty(this.productForm.get('editorContentUsage')?.value);
  body.composition = this.sanitizeAndCheckEmpty(this.productForm.get('editorContentComposition')?.value);
  body.characteristic = this.sanitizeAndCheckEmpty(this.productForm.get('editorContentCharacteristic')?.value);

  body.price = this.calcCurrencyToEur(this.productForm.get("price")?.value);

  const discount = this.productForm.get("discountRate")?.value;
  body.discountRate = discount >= body.price ? 0 : this.calcCurrencyToEur(discount);

  if (body.discountRate > 0)
    body.marketStatus = MarketStatus.Sale;

  if (this.variantActive)
    this.variantSelectorComponent.prepareForSubmit();

  body.groupedVariants = this.variantHolder;

  body.category = this.selectedCategoryItems;
  body.subCategory = this.selectedSubCategoryItems;
  body.occasion = this.selectedOccasionItems;
 // body.bundle = this.selectedBundleItems;
  body.brand = this.selectedBrandItems;
  body.series = this.selectedBrandSeriesItems;
  body.subBrand = this.selectedSubBrandItems;
  body.bundle = this.bundleInput;

  // === VALIDATION BEFORE REQUEST ===
  const extraProps = validateProductInput(body);
  const arrayErrors = validateArrayFields(body);
/*
  if (this.productForm.invalid || extraProps.length > 0 || arrayErrors.length > 0) {
    console.error("🚨 Validation Errors:", {
      formErrors,
      unexpectedProperties: extraProps,
      arrayTypeErrors: arrayErrors
    });

    const messages: string[] = [];

    if (extraProps.length)
      messages.push('⚠️ Unexpected fields:\n' + extraProps.join(', '));

    if (arrayErrors.length)
      messages.push('⚠️ Array field errors:\n' + arrayErrors.join('\n'));

    if (formErrors.length)
      messages.push('⚠️ Form field errors:\n' + formErrors.join('\n'));

    alert(messages.join('\n\n'));
    return;
  }
*/
  // === SUBMIT ===
  try {
    if (this.productId > 0) {
      body.id = this.productId;
      await this.updateProduct(this.productId, body);
    } else {
      await this.createProduct(body);
    }

    console.log("✅ Final Payload:", body);
  } catch (error) {
    const msg = error?.error?.failureMessage || error?.error?.message || error?.message || 'Unknown server error';
    alert('❌ Product was not created:\n' + msg);
  }
}


  // add opearation to create

  private async createProduct(body: AddProduct): Promise<void> {
    try {
      const _oResult = this.productForm.get("mockProductsCount").value > 1 ? await this.actionService.createMockProduct(body) : await this.actionService.createProduct(body);
      if (_oResult.success) {

        alert("Product was added successfully!");
      } else {
        alert(_oResult.failureMessage);
      }
    } catch (error) {
          const msg =
      error?.error?.failureMessage ||
      error?.error?.message ||
      error?.message ||
      'Unknown server error';
    alert('❌ Product was not created:\n' + msg);
    }
  }
  
  private async updateProduct(productId: number, body: AddProduct): Promise<void> {
    try {
      const _oResult = await this.actionService.updateProduct(productId, body);
      if (_oResult.success) {
      //   await this.productService.saveStoryPage(this.productId, this.storyPage);

        alert("Product was updated successfully!");
      } else {
        alert(_oResult.failureMessage);
      }
    } catch (error) {
         const msg =
      error?.error?.failureMessage ||
      error?.error?.message ||
      error?.message ||
      'Unknown server error';
    alert('❌ Product was not created:\n' + msg);
    }
  }


  // HANDLE DROPDOWN MULTI CHECKBOXES
  // Relation Category
  async handleCategoryChange(selectedItems: Category[]): Promise<void> {
    return new Promise<void>((resolve) => {
      // Filter and update the operation property for selected items
      const updatedSelectedItems = selectedItems
        .filter((item) => item.isSelected)
        .map((item) => {
          return {
            ...item,
            operation: this.productId > 0 ? Operations.Update : Operations.Create
          };
        });
  
      // Extract the shortNames of selected categories
      const selectedValues = updatedSelectedItems.map((item) => item.shortName);
  
      if (selectedValues.length > 0) {
        // Filter subcategories based on the selected category shortNames
        this.subCategoryOptions = this.subCategories?.filter((subCategory) =>
          selectedValues.includes(subCategory.categoryShortName)
        );
  
        // Clear selected subcategories if they no longer match the selected categories
        this.selectedSubCategoryItems = this.selectedSubCategoryItems.filter((subCategory) =>
          selectedValues.includes(subCategory.categoryShortName)
        );
      }
  
      // Update the selected category items
      this.selectedCategoryItems = updatedSelectedItems;
      this.setToLocalStorage("categories", updatedSelectedItems);
  
      resolve(); // Resolve the promise after the options are updated
    });
  }
  
  async onSearchCategory(): Promise<void> {
    const foundCategory = this.categories?.find(category =>
      category.title?.toLowerCase().includes(this.searchCategoryQuery?.toLowerCase())
    );
  
    if (foundCategory) {
      foundCategory.isSelected = true;
  
      // Wait for category change handling to complete
      await this.handleCategoryChange([...this.selectedCategoryItems, foundCategory]);
    }
  }
  
  async onSearchSubCategory(): Promise<void>  {
    const selectedCategoryShortNames = this.selectedCategoryItems?.map(item => item.shortName);
  
    const foundSubCategory = this.subCategories?.filter(subCategory => 
      selectedCategoryShortNames.includes(subCategory.categoryShortName)
    ).find(subCategory =>
      subCategory.title?.toLowerCase().includes(this.searchSubCategoryQuery?.toLowerCase())
    );
  
    if (foundSubCategory) {
      foundSubCategory.isSelected = true;
      await this.handleSubCategoryChange([...this.selectedSubCategoryItems, foundSubCategory]);
    }
  }

  async onSearchBrand(): Promise<void> {
    const found = this.brands?.find(brand =>
      brand.title?.toLowerCase().includes(this.searchBrandQuery?.toLowerCase())
    );
  
    if (found) {
      found.isSelected = true;
  
      // Wait for category change handling to complete
      await this.handleBrandChange([...this.selectedBrandItems, found]);
    }
    
  }
  
  async onSearchSeries(): Promise<void>  {
    const selectedBrandSeriesShortNames = this.selectedBrandItems?.map(item => item.shortName);
    const foundSub = this.brandSeries?.filter(series => 
      selectedBrandSeriesShortNames.includes(series.brandShortName)
    ).find(sub =>
      sub.title?.toLowerCase().includes(this.searchBrandSeriesQuery?.toLowerCase())
    );
  
    if (foundSub) {
      foundSub.isSelected = true;
      await this.handleSeriesChange([...this.selectedBrandSeriesItems, foundSub]);
    }
  }
  async onSearchSubBrand(): Promise<void>  {
    const selectedSubBrandShortNames = this.selectedBrandSeriesItems?.map(item => item.shortName);
  

    const foundSub = this.subBrands?.filter(sub => 
      selectedSubBrandShortNames.includes(sub.seriesShortName)
    ).find(sub =>
      sub.title?.toLowerCase().includes(this.searchSubBrandsQuery?.toLowerCase())
    );
  
    if (foundSub) {
      foundSub.isSelected = true;
      await this.handleSubBrandChange([...this.selectedSubBrandItems, foundSub]);
    }
  }
  
  async handleSubCategoryChange(selectedItems: SubCategory[]): Promise<void> {
    return new Promise<void>((resolve) => {
    // Filter and update the operation for selected subcategories
    const selectedValues = selectedItems
      .filter(item => item.isSelected)
      .map(item => {
        item.Operation = this.productId > 0 ? Operations.Update : Operations.Create;
        return item;
      });
  
    // Update the selected subcategory items and persist them in local storage
    this.selectedSubCategoryItems = selectedValues;

    this.setToLocalStorage("subcategories", selectedValues);

    resolve(); // Resolve the promise after the options are updated
  });
  }
  
  async handleBrandChange(selectedItems: Brand[]): Promise<void> {
      return new Promise<void>((resolve) => {
        // Filter and update the operation property for selected items
        const updatedSelectedItems = selectedItems
          .filter((item) => item.isSelected)
          .map((item) => {
            return {
              ...item,
              operation: this.productId > 0 ? Operations.Update : Operations.Create
            };
          });
    
        // Extract the shortNames of selected categories
        const selectedValues = updatedSelectedItems.map((item) => item.shortName);
    
        if (selectedValues.length > 0) {
          // Filter subcategories based on the selected category shortNames
          this.brandSeriesOptions = this.brandSeries?.filter((series) =>
            selectedValues.includes(series.brandShortName)
          );
    
          // Clear selected subcategories if they no longer match the selected categories
          this.selectedBrandSeriesItems = this.selectedBrandSeriesItems.filter((series) =>
            selectedValues.includes(series.brandShortName)
          );

          // Filter subcategories based on the selected category shortNames
          this.subBrandsOptions = this.subBrands?.filter((subBrand) =>
            selectedValues.includes(subBrand.brandShortName)
          );
    
          // Clear selected subcategories if they no longer match the selected categories
          this.selectedSubBrandItems = this.selectedSubBrandItems.filter((subBrand) =>
            selectedValues.includes(subBrand.brandShortName)
          );

        }
    
        // Update the selected category items
        this.selectedBrandItems = updatedSelectedItems;
        this.setToLocalStorage("brands", updatedSelectedItems);
    
        resolve(); // Resolve the promise after the options are updated
      });
  }

  async handleSeriesChange(selectedItems: SubBrand[]): Promise<void> {
      return new Promise<void>((resolve) => {
      // Filter and update the operation for selected subcategories
      const selectedValues = selectedItems
        .filter(item => item.isSelected)
        .map(item => {
          item.Operation = this.productId > 0 ? Operations.Update : Operations.Create;
          return item;
        });
    
      // Update the selected subcategory items and persist them in local storage
      this.selectedBrandSeriesItems = selectedValues;
  
      this.setToLocalStorage("brandSeries", selectedValues);
  
      resolve(); // Resolve the promise after the options are updated
    });
  }


  async handleSubBrandChange(selectedItems: SubBrand[]): Promise<void> {
      return new Promise<void>((resolve) => {
      // Filter and update the operation for selected subcategories
      const selectedValues = selectedItems
        .filter(item => item.isSelected)
        .map(item => {
          item.Operation = this.productId > 0 ? Operations.Update : Operations.Create;
          return item;
        });
    
      // Update the selected subcategory items and persist them in local storage
      this.selectedSubBrandItems = selectedValues;
  
      this.setToLocalStorage("subBrands", selectedValues);
  
      resolve(); // Resolve the promise after the options are updated
    });
  }
/*
  handleBundleChange(selectedItems: Brand[]) {
    // Extract the shortNames of selected categories
    const selectedValues = selectedItems.filter((item) => item.isSelected)
    .map((item) => {
      item.isSelected = true;
      item.Operation = this.productId > 0 ? Operations.Update : Operations.Create;
      return item;
    });

  //  this.selectedBundleItems = selectedValues;
  //  this.setToLocalStorage("bundles", selectedValues);
  }*/

  handleOccasionChange(selectedItems: Occasion[]) {
    // Extract the shortNames of selected categories
    const selectedValues = selectedItems//.filter((item) => item.isSelected)
    .map((item) => {
      item.isSelected = true;
      item.Operation = this.productId > 0 ? Operations.Update : Operations.Create;
      return item;
    });

    this.selectedOccasionItems = selectedValues;

    this.setToLocalStorage("occasions", selectedValues);
  }
  

  private async setValuesOnUpdate(entity: ProductById): Promise<void> {

    console.log(entity)
    // Update form values
    this.productForm.patchValue({
      title: entity.product.title || '',
      details: entity.product.details || '',
      videoUrl: entity.product.videoUrl || '',
      quantity: entity.product.quantity || 1,
      price:  this.calcCurrencyToBgn(entity.product.price),
      discountRate: this.calcCurrencyToBgn(entity.product.discountRate), 
      gender: entity.product.gender || Gender.None,
      status: entity.product.status || Status.Available,
      approveType: entity.product.approveType || ApproveType.Success,
      itemType: entity.product.itemType || ItemType.Physical,
      marketStatus: entity.product.marketStatus || MarketStatus.New,
      trademark: entity.product.trademark || Trademarks.NONE,
      editorContent: entity.product.description || '',
      editorContentUsage: entity.product.usage || '',
      editorContentComposition: entity.product.composition || '',
      editorContentCharacteristic: entity.product.characteristic || '',
    });
    

    this.quantity = entity.product.quantity || 1;
  
    // Set images
    this.imageHolder = entity.images || [];
   // console.log(this.imageHolder)
    //this.imageHolderBuffer = entity.images || [];

    if (this.imageHolder.length > 0) {
      this.imageHolder[0].imageType = 1; // Ensure the first image is marked as the main image
    }

      this.imageUploaderComponent.setImages(this.imageHolder);
  
      // Handle variants if available
      if(this.variantActive) {
      this.variantHolder = entity.groupedVariants || [];
      this.variantInputs = this.fb.array(this.variantHolder);

      this.variantSelectorComponent.setSelectedVariants(this.variantHolder)
      }
     //   if (entity.bundles && entity.bundles.length > 0) 
     //   this.handleBundleChange(entity.bundles);

        if (this.occasionActive && entity.occasions && entity.occasions.length > 0) 
        this.handleOccasionChange(entity.occasions);
      
        if(this.categoriesActive) {
        // Set selected categories and subcategories
        if (entity.categories && entity.categories.length > 0) {
          this.searchCategoryQuery = entity.categories.map(cat => cat.title).toString() || '';      
          await this.onSearchCategory();
        }
      
        if (entity.subCategories && entity.subCategories.length > 0) {
          this.searchSubCategoryQuery = entity.subCategories.map(subCat => subCat.title).toString() || '';         
          await this.onSearchSubCategory();
        }
      }

        if (this.brandActive) {

        if (entity.brands && entity.brands.length > 0) {
          this.searchBrandQuery = entity.brands.map(ent => ent.title).toString() || '';
          await this.onSearchBrand();
        }
                   
        if (entity.series && entity.series.length > 0) {
          this.searchBrandSeriesQuery = entity.series.map(sub => sub.title).toString() || '';
          await this.onSearchSeries();
        }
  
        if (entity.subBrands && entity.subBrands.length > 0) {
          this.searchSubBrandsQuery = entity.subBrands.map(sub => sub.title).toString() || '';
          await this.onSearchSubBrand();
        }
      }
      
      this.productById = entity;
    // Set local storage
  //  this.setToLocalStorage("productItem", entity.product);
  }
  
  
  // Fetched Product from URL
  async handleFetchDataFromURLChange(value: Product) {
    this.imageHolder = value.images;
  
    // Ensure the first image is marked as the main image
    if (this.imageHolder?.length > 0) {
      this.imageHolder[0].imageType = 1;
    }
  
    this.imageUploaderComponent.setImages(this.imageHolder);
  
    this.productForm.patchValue({
      title: value.title,
      details: value.about,
      price: this.calcCurrencyToEur(value.price),
      discountRate: this.calcCurrencyToEur(value.discountRate),
    });
  
    this.searchCategoryQuery = value.category;
    this.searchSubCategoryQuery = value.subCategory;

    await this.onSearchCategory();
    await this.onSearchSubCategory();
  }

  onStoryChanged(updatedStory: StoryPage) {
  this.storyPage = updatedStory;
  }

  onBundleCreated($event: BundleInput) {
    this.bundleInput = $event;
  }
  private sanitizeHtmlContent(htmlstring: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, htmlstring);
  }
  
  private sanitizeAndCheckEmpty(content: string): string {
    // Sanitize the HTML content
    const sanitizedContent: SafeHtml = this.sanitizeHtmlContent(content);
  
    // Cast SafeHtml to string for checking purposes
    const sanitizedString: string = sanitizedContent as string;
  
    // Check if the sanitized content is an empty paragraph or has no visible content
    return sanitizedString === '<p></p>' || sanitizedString.trim() === '' ? '' : sanitizedString;
  }

  private calcCurrencyToEur(val: number) {
    const eurPrice = 1;
    const calculatedVal = (val * eurPrice) / this.env.defaultCurrencyPrice;
    return parseFloat(calculatedVal.toFixed(2));
  }
  private calcCurrencyToBgn(val: number) {
    const eurPrice = 1;
    const calculatedVal = (val * this.env.defaultCurrencyPrice) / eurPrice;
    return parseFloat(calculatedVal.toFixed(2));
  }
  private setToLocalStorage(title: string, array: any) {
    if(this.productId) return;

    localStorage.setItem(title, JSON.stringify(array));
  }

  clearLocalStorage(): void {
    localStorage.removeItem("productItem");
    localStorage.removeItem("imagesItem");
    localStorage.removeItem("variantsItem");

    localStorage.removeItem("categories");
    localStorage.removeItem("subcategories");

    localStorage.removeItem("brands");
    localStorage.removeItem("subBrands");
    localStorage.removeItem("brandSeries");
    localStorage.removeItem("occasions");

    location.reload();
  }


  private retriveRelationStorage() {
    let categoryItem = JSON.parse(localStorage.getItem("categories") || "[]");
    let subCategoryItem = JSON.parse(localStorage.getItem("subcategories") || "[]");
    let brandItem = JSON.parse(localStorage.getItem("brands") || "[]");
    let brandSeriesItem = JSON.parse(localStorage.getItem("brandSeries") || "[]");
    let subBrandItem = JSON.parse(localStorage.getItem("subBrands") || "[]");
  //  let bundleItem = JSON.parse(localStorage.getItem("bundles") || "[]");
    let occasionItem = JSON.parse(localStorage.getItem("occasions") || "[]");

    let allItems = {
      categoryItem,
      subCategoryItem,
      brandItem,
      brandSeriesItem,
      subBrandItem,
    //  bundleItem,
      occasionItem,
    };

    // 2. Check if any of the items are not an array and handle accordingly
    for (let key in allItems) {
      if (!Array.isArray(allItems[key])) {
        allItems[key] = [];
      }
    }

    this.selectedCategoryItems = categoryItem;
    this.selectedSubCategoryItems = subCategoryItem;
    this.selectedBrandItems = brandItem;
    this.selectedBrandSeriesItems = brandSeriesItem;
    this.selectedSubBrandItems = subBrandItem;

    // Check if multiCheckboxDropdownComponent is defined before using it
    if (this.multiCheckboxDropdownComponent) {
      this.multiCheckboxDropdownComponent.onItemChange(null); // Ensure the method exists
      setTimeout(() => {
        if (this.multiCheckboxDropdownComponent) {
          this.multiCheckboxDropdownComponent.onItemChange(undefined);
        }
      }, 2000);
    }
  }

  
}

function validateProductInput(input: any): string[] {
  const expectedKeys = [
    'id', 'title', 'details', 'videoUrl', 'quantity', 'price', 'discountRate',
    'isShippable', 'pickupInStore', 'isReturnRequestAllowed', 'status',
    'approveType', 'itemType', 'marketStatus', 'image', 'mockProductsCount',
    'editorContent', 'editorContentUsage', 'editorContentComposition',
    'editorContentCharacteristic', 'imageInputs', 'variantInputs',
    'description', 'usage', 'composition', 'characteristic', 'groupedVariants',
    'category', 'subCategory', 'occasion', 'brand', 'series',
    'subBrand', 'storyPage'
  ];

  const inputKeys = Object.keys(input);
  const unexpected = inputKeys.filter(k => !expectedKeys.includes(k));
  return unexpected;
}

function validateArrayFields(body: any): string[] {
  const arrayFields = [
    'image', 'imageInputs', 'variantInputs', 'groupedVariants',
    'category', 'subCategory', 'occasion',
    'brand', 'series', 'subBrand'
  ];
  const arrayErrors = [];

  for (const field of arrayFields) {
    if (!Array.isArray(body[field])) {
      arrayErrors.push(`${field} is not an array`);
    }
  }

  return arrayErrors;
}



