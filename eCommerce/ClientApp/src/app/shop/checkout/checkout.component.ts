import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from "@angular/forms";
import { Observable, forkJoin, lastValueFrom, tap } from "rxjs";
import { CheckoutService } from "../../Services/Checkout/checkout.service";
import { Checkout, PaymentCondition, PromoCode } from "../../shared/classes/checkout";
import { CartService } from "../../Services/Cart/cart.service";
import { Order, OrderCreate } from "../../shared/classes/order";
import { PaypalService } from "../../Services/Payments/paypal.service";
import { StripeService } from "../../Services/Payments/stripe.service";
import { PaypPalInput } from "../../shared/classes/paypal";
import { ProductsService } from "../../Services/Product/products.service";
import { environment } from "environments/environment";
import { Router } from "@angular/router";
import { BaseService } from "src/app/Services/base.service";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";
import { SubscriptionTrackerService } from "src/app/Services/Tracker/subscription-tracker.service";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { Country } from "src/app/shared/classes/country";
import { AuthResponse } from "src/app/shared/classes/account";
import { AccountService } from "src/app/Services/Account/account.service";
import { ProductById } from "src/app/shared/classes/products/productById";
import { ApproveType } from "src/app/shared/classes/enums/approveType";
import { OperationResult } from "src/app/shared/interfaces/operationResult";
import FingerprintJS from '@fingerprintjs/fingerprintjs';


@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})

export class CheckoutComponent implements OnInit, OnDestroy {
  componentName: string = "CheckoutComponent";
  currBreadCrumb: BreadcrumbObject[] = [{ title: "Checkout", url: "/shop/checkout" }];
  env = environment;

  products$: Observable<any>;
  settings = this.env.pagesSettings.CheckoutSettings;
  countries: Array<String> = this.env.countriesSettings.shippingAvaliableTo;

  promoCodes = this.settings.PromotionalCodes;
  appliedPromo: PromoCode;
  appliedPromoState: number;

  avaliableCountries: Country[] = [];
  isOrderCreated: any;
  orderReceivePlace: Array<string> = ["Office Delivery", "Home Delivery"];

  btnSubmitLoader: boolean = false;
  selectedCheckbox: boolean;

  products: ProductById[] = [];
  orders: Order[] = [];

  checkoutForm: UntypedFormGroup | undefined;
  paypalInput: PaypPalInput = {};
  orderInput: Order = {};
  preCheckoutId: number;
  outputMessage: string;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private accountService: AccountService,
    private checkoutService: CheckoutService,
    private paypalService: PaypalService,
    private baseService: BaseService,
    private stripeService: StripeService,
    private subTracker: SubscriptionTrackerService,
    public productsService: ProductsService,
    public cartService: CartService,
    private ref: ChangeDetectorRef,
    public deviceDetector: BreakpointDetectorService
  ) {

    this.products$ = this.cartService.cartProducts$;
    this.buildForm();
  }

  async ngOnInit(): Promise<void> {
    const subProducts = this.products$.subscribe(async ([products, count]) => {
      for (const product of products) {
        try {
          // Check if the product is in the cart asynchronously
          const cartItem = await this.cartService.isInCart(product);
          if (cartItem) {
            product.selectedVariants = cartItem.selectedVariants;
          }
        } catch (error) {
          console.error('Error checking cart:', error);
        }
      }

      this.products = products;
    });

    this.subTracker.track({
      subscription: subProducts,
      name: "subProducts",
      fileName: this.componentName,
    });

    this.generateCountries();
    await this.fetchUserDetailsForm();
  }

  private generateCountries(): void {
    this.countries.forEach((item) => {
      switch (item) {
        case "europeCountries":
          this.avaliableCountries = this.avaliableCountries?.concat(this.env.countriesSettings.europeCountries);
          break;
      }
    });
  }

  private async fetchUserDetailsForm() {
    try {
      const x: AuthResponse = await this.accountService.getUserDetails();

      if (x.user)
        this.checkoutForm?.patchValue(x.user);
    } catch (error) {
      console.error('An error occurred during resetBanTimer:', error);
      // Handle the error as needed, e.g., display an error message.
    }
  }

  private buildForm(): void {
    this.checkoutForm = this.fb.group({
      fullName: ["", [Validators.required, Validators.minLength(5)]],
      note: [""],
      phoneNumber: ["", [Validators.required, Validators.pattern("[0-9]+")]],
      email: ["", [Validators.required, Validators.email, this.asciiOnlyValidator]],
      address: ["", [Validators.required, Validators.maxLength(50)]],
      country: ["", Validators.required],
      city: ["", [Validators.required]],
      state: ["", [Validators.required]],
      paymentType: ["", Validators.required],
      shippingType: ["", Validators.required],
      coupon: ["", this.asciiOnlyValidator],

      postalCode: ["", Validators.required],
      approveType: ApproveType.Waiting,
      isGuest: false,
      confirmPrivacy: false,
      pickupAtHome: ["", Validators.required],

      products: this.products,
      orders: this.orders,
    });
  }


  async onPreSubmit(body: Checkout): Promise<void> {
    body.paymentCondition = PaymentCondition.Discount;
    this.btnSubmitLoader = true;

    try {
      const response: OperationResult = await this.checkoutService.CreatePreCheckout(body);

      if (response.success)
        this.preCheckoutId = response.id;

      this.btnSubmitLoader = false;
    } catch (error) {
      // Handle errors
      console.error('Error during pre checkout:', error);
    }
  }


  async onSubmit(body: Checkout): Promise<void> {
    this.btnSubmitLoader = true;

    body.isGuest = true;
    body.pickupAtHome = this.selectedCheckbox;

    body.currencyPrice = this.baseService.activeCurrency.price;
    body.currency = this.baseService.activeCurrency.currency;

    body.promoCode = this.appliedPromo;
    body.visitorID = await getVisitorId();

    await this.onSubmitRequest(body);
  }

  async onSubmitRequest(body: Checkout) {
    await lastValueFrom(forkJoin(
      this.products.map((product) =>
        this.cartService.productQuantity(product).pipe(
          tap((customerPreferenceQuantity) => (product.customerPreferenceQuantity = customerPreferenceQuantity))
        )
      )
    ));

    body.products = this.products;
    await this.onSubmitPost(body);
  }

  async onSubmitPost(body: Checkout): Promise<void> {
    try {
      this.btnSubmitLoader = true;
      const response: OrderCreate = await this.checkoutService.Create(body);

      if (response.isCreated) {
        this.checkoutService.markCheckoutAsCompleted();
        return await this.redirectOnSuccess(response, body.paymentType);
      } else {
        this.btnSubmitLoader = false;
        this.outputMessage = response.message;
        this.ref.detectChanges();
      }

    } catch (error) {
      // Handle errors
      this.btnSubmitLoader = false;
      this.router.navigate(["/shop/checkout/cancel"]);
    }
  }


  private async redirectOnSuccess(response: OrderCreate, paymentType: string): Promise<any> {
    switch (paymentType) {
      case "Cash on Delivery":
        return this.router.navigate(["/shop/checkout/cod", { code: response.code, token: response.token }]);
      case "paypal":
        return await this.ContinueWithPaypal();
      case "stripe":
        return await this.ContinueWithStripe();
      default:
        return this.router.navigate(["/shop/checkout/cancel"]);
    }
  }


  // Paypal
  private async ContinueWithPaypal(): Promise<void> {
    try {
      this.paypalInput.quantity = 1;
      this.paypalInput.brandName = this.env.webName;

      //this.paypalInput.currency = this.productsService.getCurrency.getValue();
      //this.paypalInput.price = await this.productTotalWithDiscount(this.products).toPromise();
      this.paypalInput.name = "Products";

      // Create paypal request
      const responseUrl = await this.paypalService.Create(this.paypalInput);

      if (responseUrl.url.length)
        window.location.href = responseUrl.url;

    } catch (error) {
      // Handle errors as needed
      console.error('Error during PayPal payment:', error);
    }
  }

  // Stripe
  private async ContinueWithStripe(): Promise<void> {
    try {
      this.paypalInput.quantity = 1;
      this.paypalInput.brandName = this.env.webName;
      //   this.paypalInput.currency = this.productsService.getCurrency.currency;
      //this.paypalInput.price = await this.productTotalWithDiscount(this.products).toPromise();
      this.paypalInput.name = "Products";

      // Create paypal request
      const responseUrl = await this.stripeService.Create(this.paypalInput);

      if (responseUrl.url.length)
        window.location.href = responseUrl.url;

    } catch (error) {
      // Handle errors as needed
      console.error('Error during Stripe payment:', error);
    }
  }

  async applyPromoCode(event): Promise<void> {
    if (event?.length == 0) {
      this.appliedPromoState = 0;
      return;
    }

    try {
      const matchedPromo = this.promoCodes.find(promo => promo.code === event);

      if (matchedPromo) {
        const response: OperationResult = await this.checkoutService.applyPromoCode(matchedPromo);

        if (response.success) {
          this.appliedPromo = matchedPromo;
          this.appliedPromoState = 1;
        }
        else this.appliedPromoState = 0;

      } else this.appliedPromoState = 2;


      // Create a new promoCode model (assuming you have a PromoCode model defined)
      const promoCode: PromoCode = {
        code: event,
        discount: matchedPromo ? matchedPromo.discount : 0 // Set the discount if valid, otherwise set to 0
      };
    }
    catch (error) {
      // Handle errors
      console.error('Error during login:', error);
    }
  }

  setPickUpAtHomeValue($event): void {
    this.selectedCheckbox = $event;
  }


  ngOnDestroy(): void {
    this.subTracker.releaseAllForComponent(this.componentName);
  }


  asciiOnlyValidator(control: FormControl) {
    const value = control.value;
    // The regular expression checks if all characters in the string are ASCII
    const isValid = /^[\x00-\x7F]*$/.test(value);
    // If the string is not valid, return an error object. Otherwise, return null.
    return isValid ? null : { nonAscii: true };
  }
}

async function getVisitorId() {
  // Initialize an agent at application startup.
  const fp = await FingerprintJS.load();

  // Get the visitor identifier when you need it.
  const result = await fp.get();

  // This is the visitor identifier:
  return result.visitorId;
}