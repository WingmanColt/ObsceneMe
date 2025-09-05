import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActionsService } from 'src/app/Services/Product/actions.service';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Operations } from 'src/app/shared/classes/enums/operations';
import { Brand } from 'src/app/shared/classes/brands';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {
  fetchedArray: any[] = [];
  filteredArray: any[] = [];
  paginatedArray: any[] = [];
  
  modalForm: FormGroup;  // Form group for managing Brand form
  isUpdateMode: boolean = false;
  selectedFile: File | null = null;  // For file uploads

  totalItems: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;
  closeResult: string;
  searchText: string = '';
  debounceTimer: any;

  dropdownActions = [
    { id: 1, title: 'Add' },
    { id: 2, title: 'Seed' },
    { id: 3, title: 'Delete All' }
  ];  // Define the actions for the dropdown
  
  @ViewChild('popupModal', { static: true }) modalContent: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private actionsService: ActionsService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder  // FormBuilder service for creating reactive forms
  ) {}

  ngOnInit(): void {
    this.fetchAll();
    this.initializeForm();  // Initialize the form group
  }

  // Initialize the form group
  initializeForm() {
    this.modalForm = this.fb.group({
      id: [null],  // Hidden field for id
      title: ['', Validators.required],  // Title is required
      shortName: ['', Validators.required],  // Short name is required
      icon: ['']  // Optional icon field for file uploads
    });
  }

  fetchAll() {
    this.actionsService.brands$.subscribe((entities) => {
      this.fetchedArray = entities;
      this.filter();  // Initially filter the Brands
    });
  }

  filter() {
    if (this.searchText) {
      // Filter Brands based on the search text
      this.filteredArray = this.fetchedArray.filter((ent) =>
        ent.title.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      // If no search text, show all Brands
      this.filteredArray = this.fetchedArray;
    }
    this.totalItems = this.filteredArray.length;
    this.paginate();
  }

  paginate() {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedArray = this.filteredArray.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.pageNumber = page;
      this.paginate();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getPages(): number[] {
    const totalPages = this.getTotalPages();
    const pagesToShow = 5;
    let startPage: number;
    let endPage: number;

    if (totalPages <= pagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else if (this.pageNumber <= 3) {
      startPage = 1;
      endPage = pagesToShow;
    } else if (this.pageNumber + 2 >= totalPages) {
      startPage = totalPages - 4;
      endPage = totalPages;
    } else {
      startPage = this.pageNumber - 2;
      endPage = this.pageNumber + 2;
    }

    return Array.from({ length: (endPage - startPage + 1) }, (_, i) => startPage + i);
  }

  goToFirstPage() {
    this.changePage(1);
  }

  goToLastPage() {
    this.changePage(this.getTotalPages());
  }

  onSearchTextChange() {
    clearTimeout(this.debounceTimer); // Clear the previous timer
    this.debounceTimer = setTimeout(() => {
      this.pageNumber = 1;
      this.filter(); // Perform search after debounce
    }, 300); // Delay of 300ms
  }


  open(Entity = null, Brand?: Brand) {
    this.isUpdateMode = !!Brand;

    this.modalForm.reset();

    if (Brand) {
      this.modalForm.patchValue({
        id: Brand.id,
        title: Brand.title,
        shortName: Brand.shortName,
        icon: Brand.icon
      });
    }
    

    this.cdr.detectChanges();  // Manually trigger change detection
    this.modalService.open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      // const response = await this.actionsService.uploadFile(formData);
      // return response.filePath;  // Assuming the API returns the file path or URL
    } catch (error) {
      console.error('Error uploading file', error);
      throw error;
    }
  }

      // Handle dropdown action selection
      onActionSelected(selectedAction: any) {
        if (selectedAction && selectedAction.length > 0) {
          const action = selectedAction[0];  // Single select, so grab the first element
    
          if (action.title === 'Add') {
            this.open(this.modalContent, undefined);   // Open modal to add a Brand
          } 
          else if (action.title === 'Seed') {
            this.seed();  // Call seed Brands
          }
          else if (action.title === 'Delete All') {
            this.deleteAll();  // Call delete all Brands
          }
        }
      }

  async saveModal(): Promise<void> {
    try {
      if (this.selectedFile) {
        const uploadedFilePath = await this.uploadFile(this.selectedFile);
        this.modalForm.patchValue({ icon: uploadedFilePath });  // Update the icon field with the file path
      }

      const data = this.getData();

      if (this.isUpdateMode) {
        await this.actionsService.updateBrand(data);  // Update Brand
      } else {
        await this.actionsService.createBrand(data);  // Create new Brand
      }

      this.modalService.dismissAll();  // Close modal
      this.actionsService.refreshBrands();
    } catch (error) {
      console.error('Error saving Brand', error);
    }
  }

  getData(): Brand {
    const formValue = this.modalForm.value;
    const data: Brand = new Brand(this.isUpdateMode ? Operations.Update : Operations.Create);

    data.id = this.isUpdateMode ? formValue.id : 0;
    data.title = formValue.title || '';
    data.shortName = formValue.shortName || '';
    data.icon = formValue.icon || '';

    return data;
  }

  async delete(id: number): Promise<void> {
    if (confirm('Are you sure you want to delete this Brand?')) {
      try {
        await this.actionsService.deleteBrand(id);
        this.actionsService.refreshBrands();
      } catch (error) {
        console.error('Error deleting Brand', error);
      }
    }
  }
  async deleteAll(): Promise<void> {
    if (confirm('Are you sure you want to delete all Brands? This action cannot be undone.')) {
      try {
        await this.actionsService.deleteAllBrands();
        this.actionsService.refreshBrands();
      } catch (error) {
        console.error('Error deleting all Brands', error);
      }
    }
  }
  async seed(): Promise<void> {
    if (confirm('Are you sure you want to seed new Brands?')) {
      try {
        await this.actionsService.seedBrands();
        this.actionsService.refreshBrands();
      } catch (error) {
        console.error('Error seeding Brands', error);
      }
    }
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
