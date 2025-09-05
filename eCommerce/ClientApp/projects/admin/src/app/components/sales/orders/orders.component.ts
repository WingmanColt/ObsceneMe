import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TableService } from '../../../shared/service/table.service';
import { DecimalPipe } from '@angular/common';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Validators } from 'ngx-editor';
import { ActionsService } from 'src/app/Services/Product/actions.service';
import { Operations } from 'src/app/shared/classes/enums/operations';
import { Order } from 'src/app/shared/classes/order';
import { ApproveType, ApproveType_LabelMapping, OrdersWithTotalCount } from '../../../classes/product';
import { environment } from 'environments/environment';
import { Checkout } from 'src/app/shared/classes/checkout';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})

export class OrdersComponent implements OnInit {
  env = environment;

  fetchedArray: any[] = [];
  filteredArray: any[] = [];
  paginatedArray: any[] = [];

  modalForm: FormGroup;  // Form group for managing category form
  isUpdateMode: boolean = false;
  selectedFile: File | null = null;  // For file uploads

  closeResult: string;
  searchText: string = '';

  totalItems: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;
  pagesSinceLastFetch = 0;  // Track the number of pages since the last fetch

  debounceTimer: any;

  dropdownActions = [
    { id: 1, title: 'Export All To CSV' },
    { id: 2, title: 'Delete All' }
  ];  // Define the actions for the dropdown
  
  public approveTypeLabelMapping = ApproveType_LabelMapping;
  public approveType = Object.values(ApproveType).filter((value) => typeof value === "number");

  public currency: any[];
  public countries: any[];
  public shipping: any[];

  
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

    this.currency = this.env.countriesSettings.currenciesArray;
    this.countries = this.env.countriesSettings.europeCountries;
    this.shipping = this.env.pagesSettings.CheckoutSettings.ShippingTypes;
  }

  initializeForm() {
    this.modalForm = this.fb.group({
      id: [null],
      fullName: ['', Validators.required],
      cancellationReason:[''],
      trackingNumber:[''],
      note: [''],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      country: ['', Validators.required],
      city: [''],
      state: [''],
      postalCode: [''],
      pickupAtHome: [false],
      quantity: [0, Validators.required],
      code: ['', Validators.required],
      createdOn: [''],
      productTitle: [''],
      currency: [''],
      paymentType: [''],
      shippingType: [''],
      costPerItem: [null],
      discountPerItem: [null],
      discount: [null],
      cost: [null],
      isGuest: [false],
      approveType: [ApproveType.Waiting]
    });

    
  }


fetchAll() {
    const params = {
      offset: (this.pageNumber - 1) * this.pageSize,
      pageSize: this.pageSize
    };
  
    this.actionsService.getOrders(params).subscribe((response: OrdersWithTotalCount) => {
        // Log the raw response data to check its structure
        console.log('Raw response:', response);

        if (response) {
          console.log('Items:', response.items);  // Check the 'items' array
          console.log('Total Count:', response.totalCount);  // Check the totalCount

          if (response.totalCount > 0) {
            this.fetchedArray.push(...response.items);  // Append new orders
            this.totalItems = response.totalCount;     // Update total item count
            this.pagesSinceLastFetch = this.pageNumber; // Update page fetch tracking
          }
        } else {
          console.log('Response is empty');
        }

        this.filter(); // Assuming filter method exists for additional logic
      });
  }
  
 // Apply search filter
 filter() {
  if (this.searchText) {
    // Filter orders based on the search text
    this.filteredArray = this.fetchedArray.filter((ent) =>
      ent.code.toLowerCase().includes(this.searchText.toLowerCase())
    );
  } else {
    this.filteredArray = this.fetchedArray;
  }
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

    // Check if you need to fetch more data
    if (this.pageNumber > this.pagesSinceLastFetch) {
      this.fetchAll();
    } else {
      this.paginate();  // Paginate the already fetched data
    }
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


  async open(Entity = null, checkoutId: number = null) {
    this.isUpdateMode = !!Entity;
    this.modalForm.reset();

    if (checkoutId) {
      try {
        const data = await this.actionsService.getCheckout(checkoutId);

        if(data){
        // Patch the form with fetched data from InvoiceVW model
        this.modalForm.patchValue({

          // Checkout
          fullName: data.fullName,
          note: data.note,
          phoneNumber: data.phoneNumber,
          email: data.email,
          address: data.address,
          country: data.country,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          pickupAtHome: data.pickupAtHome,
          createdOn: data.createdOn,
          isGuest: data.isGuest,
          approveType: data.approveType || ApproveType.Waiting
        });

      }
      } catch (error) {
        console.error('Error fetching checkout details', error);
      }
    }

    if (Entity) {
      this.modalForm.patchValue({
          // Order
          phone: Entity.phone,
          cost: Entity.totalCost,
          quantity: Entity.quantity,
          code: Entity.code,
          currency: Entity.currency,
          paymentType: Entity.paymentType,
          shippingType:Entity.shippingType,
          costPerItem: Entity.costPerItem,
          discountPerItem: Entity.discountPerItem,
          discount: Entity.totalDiscount,
          cancellationReason: Entity.cancellationReason,
          trackingNumber: Entity.trackingNumber,
          notes: Entity.notes
      });
    }

    this.cdr.detectChanges();  // Manually trigger change detection
    this.modalService.open(this.modalContent, 
      {
        size: 'xxl',
        ariaLabelledBy: 'edit-modal',
        centered: true,
        scrollable: false,
        modalDialogClass: 'edit-dialog',
        windowClass: 'EditModal'
      }
    ).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }


      // Handle dropdown action selection
  onActionSelected(selectedAction: any) {
     if (selectedAction && selectedAction.length > 0) {
          const action = selectedAction[0];  // Single select, so grab the first element
    
          switch (action.title) {
            case 'Export All To CSV':
              this.exportAll();  // Call delete all brands
            break;
            
            case 'Delete All':
              this.deleteAll();  // Call delete all brands
            break;
          
            default:
              break;
          } 
      }
  }

  async saveModal(): Promise<void> {
    try {
      const order = this.getOrderData();
      await this.actionsService.updateOrder(order); 

      const checkout = this.getCheckoutData();
      await this.actionsService.updateCheckout(checkout); 

      this.modalService.dismissAll();  // Close modal
      this.actionsService.refreshOrders();
    } catch (error) {
      console.error('Error saving category', error);
    }
  }

  getOrderData() : Order {
    const formValue = this.modalForm.value;
    const data: Order = new Order(Operations.Update);

    data.phone = formValue.phone || '';
    data.cost = formValue.totalCost || 0;
    data.quantity = formValue.quantity || 0;
    data.code = formValue.code || '';
    data.currency = formValue.currency || '';
    data.paymentType = formValue.paymentType || '';
    data.shippingType = formValue.shippingType || ''; 
    data.costPerItem = formValue.costPerItem || 0;
    data.discountPerItem = formValue.discountPerItem || 0;
    data.discount = formValue.totalDiscount || 0;
    data.cancellationReason = formValue.cancellationReason || '';
    data.trackingNumber = formValue.trackingNumber || '';
    data.notes = formValue.notes || '';

    return data;
  }
  
  getCheckoutData() : Checkout {
    const formValue = this.modalForm.value;
    const data: Checkout = new Checkout(Operations.Update);

    data.fullname = formValue.fullName || '';
    data.phoneNumber = formValue.phoneNumber || '';
    data.email = formValue.email || '';
    data.address = formValue.address || '';
    data.city = formValue.city || '';
    data.state = formValue.state || '';
    data.postalCode = formValue.postalCode || '';
    data.pickupAtHome = formValue.pickupAtHome || false;
    data.isGuest = formValue.isGuest || false;
    data.approveType = formValue.fullName || ApproveType.Waiting;

    return data;
  }
  

  async delete(id: number): Promise<void> {
    if (confirm('Are you sure you want to delete this Order?')) {
      try {
        await this.actionsService.deleteOrder(id);
        await this.actionsService.deleteCheckout(id);

        this.actionsService.refreshOrders();
      } catch (error) {
        console.error('Error deleting order', error);
      }
    }
  }
  async exportAll(): Promise<void> {
      try {
        var fileDir = await this.actionsService.exportAllOrders();

      } catch (error) {
        console.error('Error exporting all orders', error);
      }
    
  }
  async deleteAll(): Promise<void> {
    if (confirm('Are you sure you want to delete all orders? This action cannot be undone.')) {
      try {
        await this.actionsService.deleteAllOrders();
        await this.actionsService.deleteAllCheckouts();

        this.actionsService.refreshOrders();
      } catch (error) {
        console.error('Error deleting all orders', error);
      }
    }
  }

  async getInvoice(): Promise<void> {
    if (confirm('Are you sure you want to delete all orders? This action cannot be undone.')) {
      try {
        await this.actionsService.deleteAllOrders();
        this.actionsService.refreshOrders();
      } catch (error) {
        console.error('Error deleting all orders', error);
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
