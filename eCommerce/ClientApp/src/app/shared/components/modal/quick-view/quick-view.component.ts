import {
  Component, OnInit, ViewChild, TemplateRef, Input, PLATFORM_ID, Inject, OnDestroy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { environment } from 'environments/environment';


@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.scss']
})
export class QuickViewComponent implements OnInit, OnDestroy {

  @Input() productId: number;
  //@Input() currency: any;
  @ViewChild("quickView", { static: false }) QuickView: TemplateRef<any>;

  public env = environment;
  public closeResult: string;
  public modalOpen: boolean = false;
  public counter: number = 1;

  public isInCart: number = 0;
  public isInCartIcon: string = "las la-cart-plus";

  public activeImage: string = '';
  public activeColour: boolean = false;
  public activeSize: boolean = false;
  public activeSlide: any = 0;


  @ViewChild("alertModal") AlertModal: AlertModalComponent | undefined;

  constructor(@Inject(PLATFORM_ID)
  private platformId: Object,
    private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openModal() {
    this.modalOpen = true;
    this.toggleOverlay(false);

    if (isPlatformBrowser(this.platformId)) { // For SSR 
      this.modalService.open(this.QuickView, {
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview'
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.toggleOverlay(true);
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
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
  private toggleOverlay(hardReset: boolean) {
    const overlayClass = document.getElementById('overlayPages');

    hardReset ? overlayClass.classList.remove('active') : (this.modalOpen ?
      overlayClass.classList.add('active') : overlayClass.classList.remove('active'));

    hardReset ? document.documentElement.style.overflow = 'auto' : (document.documentElement.style.overflow = this.modalOpen ? 'hidden' : 'auto')
  }
  /*
    // Increament
    increment() {
      this.counter++;
    }
  
    // Decrement
    decrement() {
      if (this.counter > 1) this.counter--;
    }
  
    finishPurchase() {
      setTimeout(() => {
        this.router.navigate(['/shop/checkout'])
      }, 100)
    }
  
    async addToCart(product: Products) {
      if (!this.errorMessages(this.counter))
        return;
  
      if (this.isInCart != 0)
        return;
  
      this.isInCart = 2;
  
      await this.cartService.addToCartAsync(product, this.counter).then(result => {
        setTimeout(() => {
          this.isInCart = result ? 1 : 0;
          this.isInCartIcon = this.isInCart ? "las la-check" : "las la-heart";
        }, 500)
      });
    }
  
    async addToCartBundle(bundleItems: BundleItems[]) {
      if (!this.errorMessages(this.counter))
        return;
  
      bundleItems.forEach(async product => {
        if (product.isSelected)
          await this.cartService.addToCartAsync(product, this.counter);
      });
    }
  
    // Buy Now
    async buyNow(product: any) {
      if (!this.errorMessages(this.counter))
        return;
  
      await this.cartService.addToCartAsync(product, this.counter).then(result => {
        if (result) {
          setTimeout(() => {
            this.router.navigate(['/shop/checkout'])
          }, 200)
        }
      });
  
    }
  
    // Add to Wishlist
    async addToWishlist(product: any) {
      await this.productService.addToWishlist(product);
    }
  
    errorMessages(quantity: number): boolean {
  
      if ((this.product?.variants?.find(x => x.color != null) && !this.activeColour) || (this.product?.variants?.find(x => x.size != null) && !this.activeSize)) {
        const str = !this.activeColour ? "color" : "size";
        this.AlertModal.text = `Please choose ${str} before purchasing this item.`;
        this.AlertModal.icon = "play las la-exclamation";
        this.AlertModal.iconColor = "color:rgb(205, 121, 81)";
        this.AlertModal?.openModal()
        return false
      }
  
      if (this.product.quantity == 0 || this.product.quantity < quantity) {
        this.AlertModal.text = `You cannot purchase more items than available.`;
        this.AlertModal.icon = "play las la-shopping-cart";
        this.AlertModal.iconColor = "color:rgb(205, 121, 81)";
        this.AlertModal?.openModal()
        return false
      }
  
      return true;
    }
  
    // Get Product Color
    Color(variants: Variants[] | undefined) {
      const uniqColor = []
  
      for (let i = 0; i < Object.keys(variants)?.length; i++) {
        if (uniqColor.indexOf(variants[i].color) === -1 && variants[i].color) {
          uniqColor.push(variants[i])
        }
      }
  
      return uniqColor
    }
  
    // Get Product Size
    Size(variants: Variants[] | undefined) {
      const uniqSize = []
      for (let i = 0; i < Object.keys(variants)?.length; i++) {
        if (uniqSize.indexOf(variants[i].size) === -1 && variants[i].size) {
          uniqSize.push(variants[i])
        }
      }
      return uniqSize
    }
  
    changeActiveImage(variant: Variants | undefined, indexInArray: number): string {
      this.activeImage = variant.imageId;
      this.clearActiveItems(indexInArray);
      return this.activeImage;
    }
  
    clearActiveItems(indexInArray: number) {
      const variants = this.product.variants;
      for (let i = 0; i < variants?.length; i++) {
        if (variants[i].color != null) {
          variants[i].isSelected = indexInArray == i ? true : false;
          this.activeColour = true;
        }
      }
    }
  
  
    selectSize(variant: Variants | undefined, indexInArray: number) {
  
      const variants = this.product.variants;
      for (let i = 0; i < variants?.length; i++) {
        if (variants[i].size != null) {
          variants[i].isSelected = indexInArray == i ? true : false;
          this.activeSize = true;
        }
      }
      variant.isSelected = true;
    }
  
  */
  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }

    this.toggleOverlay(true);
  }

}
