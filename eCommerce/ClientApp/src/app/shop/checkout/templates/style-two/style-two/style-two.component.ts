import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { environment } from "environments/environment";
import { CartService } from "src/app/Services/Cart/cart.service";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { DiscountModalService } from "src/app/Services/Modal/modal.service";
import { SubscriptionTrackerService } from "src/app/Services/Tracker/subscription-tracker.service";
import { BaseService } from "src/app/Services/base.service";
import { Checkout, PromoCode } from "src/app/shared/classes/checkout";
import { Discount } from "src/app/shared/classes/discount";
import { Country, PaymentType, ShippingType } from "src/app/shared/classes/envClasses";
import { ProductById } from "src/app/shared/classes/products/productById";

@Component({
  selector: "app-checkout-style-two",
  templateUrl: "./style-two.component.html",
  styleUrls: ["./style-two.component.scss"],
})
export class StyleTwoComponent implements OnInit, OnDestroy {
  componentName: string = "StyleTwoComponent";
  env = environment;

  settings = this.env.pagesSettings.CheckoutSettings;
  paymentMethods: PaymentType[]  = this.settings.PaymentTypes;
  shippingMethods: ShippingType[] = this.settings.ShippingTypes;
  isMobile: boolean;

  @Input() products: ProductById[];
  @Input() checkoutForm: UntypedFormGroup | undefined;
  @Input() avaliableCountries: Country[];
  @Input() btnSubmitLoader: boolean;
  @Input() orderReceivePlace: Array<string>;
  @Input() outputMessage: string;

  @Input() appliedPromo: PromoCode;
  @Input() appliedPromoState: number;

  @Output() submitForm = new EventEmitter<Checkout>();
  @Output() submitPreForm = new EventEmitter<any>();

  @Output() ApplyPromo = new EventEmitter<string>();
  @Output() selectedPickUpAtHome = new EventEmitter<boolean>();

  selectedPaymentIndex: number | null = null;
  selectedShippingIndex: number | null = null;
  selectedShippingModel: ShippingType;

  selectedShipping: string;
  selectedPayment: string;
  selectedCountry: string;

  isFinalTab: boolean = false;
  isExpandedComments: boolean;
  isExpandedCoupon: boolean;

  couponValue: string = "";
  appliedCoupons: Discount[] = [];

  totalDiscount: number = 0;
  //calculatedTotal: number = 0;

  private oldEvent: any;

  constructor(
    public cartService: CartService,
    public baseService: BaseService,
    private modalService: DiscountModalService,
    private subTracker: SubscriptionTrackerService,
    private deviceService: BreakpointDetectorService
  ) {}

  async ngOnInit() {
  this.isMobile = this.deviceService.isDevice("Mobile");
  const welcomeCoupon = await this.modalService.getModalState();

    if (welcomeCoupon == 2) {
      const welcomePromoCode = this.settings.PromotionalCodes[0];
      this.appliedCoupons.push(welcomePromoCode);

      this.applyPromoCode();
      this.isExpandedCoupon = false;
    }

    this.setDefaultValuesForDropdown();
  }

  ngOnDestroy(): void {
    this.subTracker.releaseAllForComponent(this.componentName);
  }

  setDefaultValuesForDropdown() {
    // Automatically select the country if there is only one available
    this.selectedCountry = this.avaliableCountries.length === 1 ? this.avaliableCountries[0].label : 'Choose Country';
    this.checkoutForm.get("country")?.setValue(this.selectedCountry); 

    this.selectedPayment = this.paymentMethods.length === 1 ? this.paymentMethods[0].label : 'Select Payment';
    this.checkoutForm.get("paymentType")?.setValue(this.selectedPayment); 

    this.selectedShipping = this.shippingMethods.length === 1 ? this.shippingMethods[0].label : 'Select Shipping';
    this.checkoutForm.get("shippingType")?.setValue(this.selectedShipping); 
  }

  onSubmit($event: Checkout): void {
    if (!this.checkForFormErrors()) return;

    const subTotal = this.cartService
      .getTotalAmount(this.totalDiscount, this.selectedShippingModel?.cost)
      .subscribe((totalAmount) => {
        $event.totalCost = totalAmount;
        $event.totalDiscount = this.totalDiscount;

        this.submitForm.emit($event);
      });

    this.subTracker.track({
      subscription: subTotal,
      name: "subProducts",
      fileName: this.componentName,
    });
  }

  toggleCollapse(index: number): void {
    this.paymentMethods.forEach((option, idx) => {
      option.isExpanded = idx === index;
    });
    this.selectedPaymentIndex = index;
  }

  toggleCollapseShipping(index: number): void {
    this.shippingMethods.forEach((option, idx) => {
      option.isExpanded = idx === index;
    });
    this.selectedShippingIndex = index;
  }

  toggleCollapseComment(): void {
    this.isExpandedComments = !this.isExpandedComments;
  }
  toggleCollapseCoupon(): void {
    this.isExpandedCoupon = !this.isExpandedCoupon;
  }

  setShippingValue($event: any): void {
    this.selectedShippingModel = $event[0];
    this.checkoutForm.get("shippingType")?.setValue(this.selectedShippingModel.label);
  }

  setCountryValue($event: any): void {
    this.selectedCountry = $event.label; // Update the selected country
    this.checkoutForm.get("country")?.setValue($event.label); // Update form control
  }

  setPaymentValue($event: any): void {
    this.selectedPayment = $event.label; // Update the selected country
    this.checkoutForm.get("paymentType")?.setValue($event.shortname);
  }

  activateFinalTab(event, next: boolean) {
    if (next) this.isFinalTab = !this.isFinalTab;
    this.submitPreForm.emit(event);
    this.checkForFormErrors();
  }

  deactivateFinalTab() {
    this.isFinalTab = false;
  }

  setPromoCode() {
    const coupon = this.checkoutForm.get("coupon")?.value;
    const couponModel = this.settings.PromotionalCodes.find(
      (x) => x.code === coupon
    );

    if (couponModel && !this.appliedCoupons.includes(couponModel)) {
      this.appliedCoupons.push(couponModel);
      this.couponValue = "";

      this.applyPromoCode();
      //this.cartService.updateCart();

      this.ApplyPromo.emit(coupon);
    } else this.appliedPromoState = 2;

    setTimeout(() => {
      this.appliedPromoState = 0;
    }, 2000);
  }

  applyPromoCode() {
    this.totalDiscount = this.appliedCoupons.reduce((accumulator, coupon) => {
      if (!coupon.isApplied) {
        // Calculate the discount without exceeding 100%
        const remainingDiscount = 1.0 - accumulator;
        const applicableDiscount = Math.min(coupon.discount, remainingDiscount);

        accumulator += applicableDiscount;
        coupon.isApplied = true;
      }
      return accumulator;
    }, this.totalDiscount);
  }

  checkForFormErrors(): boolean {
    // Mark all fields as touched to trigger validation
    for (const controlName in this.checkoutForm.controls) {
      if (this.checkoutForm.controls.hasOwnProperty(controlName)) {
        this.checkoutForm.controls[controlName].markAsTouched();
      }
    }
    // Return the validity of the form
    return this.checkoutForm.valid;
  }

  appliedFilter(event) {
    if (!event.target.checked) return;

    let index = this.orderReceivePlace.indexOf(event.target.value); // checked and unchecked value
    this.selectedPickUpAtHome.emit(index ? true : false);

    if (this.oldEvent) this.oldEvent.target.checked = false;

    this.oldEvent = event;
  }

  // check if the item are selected
  checked(item) {
    if (this.orderReceivePlace.indexOf(item) != -1) {
      return false;
    }

    return true;
  }
}
