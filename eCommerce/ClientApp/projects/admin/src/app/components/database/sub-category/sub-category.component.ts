import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActionsService } from 'src/app/Services/Product/actions.service';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category, SubCategory } from 'src/app/shared/classes/categories'; // Assuming a SubCategory class exists
import { Operations } from 'src/app/shared/classes/enums/operations';

@Component({
  selector: 'app-sub-category',
  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.scss'],
})
export class SubCategoryComponent implements OnInit {
  allSubCategories: any[] = [];
  filteredSubCategories: any[] = [];
  paginatedSubCategories: any[] = [];
  allCategories: Category[] = []; // To store the list of categories
  
  modalForm: FormGroup; 
  isUpdateMode: boolean = false;
  selectedFile: File | null = null;
  selectedCategoryShortName: string = ''; // To store the selected category shortname

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
    private fb: FormBuilder // FormBuilder service
  ) {}

  ngOnInit(): void {
    this.fetchAll();
    this.fetchCategories(); // Fetch categories when component initializes
    this.initializeForm(); // Initialize the form
  }

  // Initialize the form group
  initializeForm() {
    this.modalForm = this.fb.group({
      id: [null], // Hidden field for id
      title: ['', Validators.required],
      shortName: ['', Validators.required], 
      categoryShortName: ['', Validators.required], 
      icon: ['']
    });
  }

  fetchAll() {
    this.actionsService.subCategories$.subscribe((subCategories) => {
      this.allSubCategories = subCategories;
      this.filter();
    });
  }
    // Fetch categories from actionsService
    fetchCategories() {
      this.actionsService.categories$.subscribe((categories) => {
        this.allCategories = categories;
      });
    }

    filter() {
      if (this.searchText) {
        // Check if searchText starts with "#"
        if (this.searchText.startsWith('#')) {
          const shortNameSearch = this.searchText.substring(1); // Remove the "#" for searching
          this.filteredSubCategories = this.allSubCategories.filter((category) =>
            category.categoryShortName.toLowerCase().includes(shortNameSearch.toLowerCase())
          );
        } else {
          // Default filtering by title
          this.filteredSubCategories = this.allSubCategories.filter((category) =>
            category.title.toLowerCase().includes(this.searchText.toLowerCase())
          );
        }
      } else {
        // If no search text, return all categories
        this.filteredSubCategories = this.allSubCategories;
      }
      
      this.totalItems = this.filteredSubCategories.length;
      this.paginate();
    }
    

  paginate() {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSubCategories = this.filteredSubCategories.slice(startIndex, endIndex);
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

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
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

  open(Entity = null) {
    this.isUpdateMode = !!Entity;

    this.modalForm.reset();

    if (Entity) {
      this.modalForm.patchValue({
        id: Entity.id,
        title: Entity.title,
        shortName: Entity.shortName,
        icon: Entity.icon,
        categoryShortName: Entity.categoryShortName // Pre-select the category based on the entity data
      });

      const selectedCategory = this.findCategoryByShortName(Entity.categoryShortName);
      if (selectedCategory) {
        this.modalForm.patchValue({ categoryShortName: selectedCategory.shortName });
      }
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
      // return response.filePath; // Assuming the API returns the file path or URL
    } catch (error) {
      console.error('Error uploading file', error);
      throw error;
    }
  }

 // Handle Category selection from dropdown
 onCategorySelected(categoryShortName: string) {
  this.selectedCategoryShortName = categoryShortName;
  this.modalForm.patchValue({ categoryShortName }); // Update the form with selected category's short name
}

  // Handle dropdown action selection
  onActionSelected(selectedAction: any) {
    if (selectedAction && selectedAction.length > 0) {
      const action = selectedAction[0];  // Single select, so grab the first element

      if (action.title === 'Add') {
        this.open();  // Open modal to add a brand
      } 
      else if (action.title === 'Seed') {
        this.seed();  // Call seed brands
      }
      else if (action.title === 'Delete All') {
        this.deleteAll();  // Call delete all brands
      }
    }
  }

  async saveModal(): Promise<void> {
    try {
      if (this.selectedFile) {
        const uploadedFilePath = await this.uploadFile(this.selectedFile);
        this.modalForm.patchValue({ icon: uploadedFilePath });
      }

      const subCategoryData = this.getSubCategoryData();

      if (this.isUpdateMode) {
        await this.actionsService.updateSubCategory(subCategoryData); // Update subcategory
      } else {
        console.log(subCategoryData)
        await this.actionsService.createSubCategory(subCategoryData); // Create new subcategory
      }

      this.modalService.dismissAll(); // Close modal
      this.actionsService.refreshSubCategories();
    } catch (error) {
      console.error('Error saving subcategory', error);
    }
  }

  getSubCategoryData(): SubCategory {
    const formValue = this.modalForm.value;
    const subCategoryData: SubCategory = new SubCategory(
      this.isUpdateMode ? Operations.Update : Operations.Create
    );

    subCategoryData.id = this.isUpdateMode ? formValue.id : 0;
    subCategoryData.title = formValue.title || '';
    subCategoryData.shortName = formValue.shortName || '';
    subCategoryData.icon = formValue.icon || '';
    subCategoryData.categoryShortName = formValue.categoryShortName || '';

    return subCategoryData;
  }

  compareCategories(c1: string, c2: string): boolean {
    return c1 === c2;
  }

  findCategoryByShortName(shortName: string): Category | undefined {
    return this.allCategories.find(category => category.shortName === shortName);
  }

  async delete(id: number): Promise<void> {
    if (confirm('Are you sure you want to delete this SubCategory?')) {
      try {
        await this.actionsService.deleteSubCategory(id);
        this.actionsService.refreshSubCategories();
      } catch (error) {
        console.error('Error deleting subCategory', error);
      }
    }
  }
  async deleteAll(): Promise<void> {
    if (confirm('Are you sure you want to delete all subCategories? This action cannot be undone.')) {
      try {
        await this.actionsService.deleteAllSubCategories();
        this.actionsService.refreshSubCategories();
      } catch (error) {
        console.error('Error deleting all subCategories', error);
      }
    }
  }
  async seed(): Promise<void> {
    if (confirm('Are you sure you want to seed new subCategories?')) {
      try {
        await this.actionsService.seedSubCategories();
        this.actionsService.refreshSubCategories();
      } catch (error) {
        console.error('Error seeding subCategories', error);
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
