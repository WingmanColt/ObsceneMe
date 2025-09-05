import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { CartService } from "src/app/Services/Cart/cart.service";
import { BaseService } from "src/app/Services/base.service";
import { Products } from "src/app/shared/classes/product";

@Component({
    selector: "app-checkout-style-one",
    templateUrl: "./style-one.component.html",
    styleUrls: ["./style-one.component.scss"],
})
export class StyleOneComponent {
    settings = environment.pagesSettings.CheckoutSettings;
    allPayments = this.settings.PaymentTypes;
    shippingMethods = this.settings.ShippingTypes;

    @Input() products$: Observable<any>;
    @Input() checkoutForm: UntypedFormGroup;
    @Input() avaliableCountries: String[];
    @Input() btnSubmitLoader: boolean;

    @Output() submitForm = new EventEmitter<UntypedFormGroup>();

    selectedPayment: number | null = null;
    selectedShipping: number | null = null;

    constructor(public cartService: CartService, private baseService: BaseService) { }

    onSubmit($event): void {
        this.submitForm.emit($event);
    }
    updateCurrency(val: any) {
        return (val * this.baseService.activeCurrency.price).toFixed(2);
    }
    productCount(product: Products): Observable<number> {
        return this.cartService.productQuantity(product);
    }
    productTotalDiscount(products: Products[]) {
       // return this.cartService.getTotalDiscount(products);
    }
    productTotalWithDiscount(): Observable<number> {
        return this.cartService.getTotalAmount();
    }
    toggleCollapse(index: number): void {
        this.allPayments.forEach((option, idx) => {
            option.isExpanded = idx === index;
        });

        this.selectedPayment = index;
    }

    toggleCollapseShipping(index: number): void {
        this.shippingMethods.forEach((option, idx) => {
            option.isExpanded = idx === index;
        });

        this.selectedShipping = index;
    }
}
