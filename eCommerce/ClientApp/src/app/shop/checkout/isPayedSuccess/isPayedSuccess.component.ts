import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CartService } from "../../../Services/Cart/cart.service";
import { PaypalService } from "../../../Services/Payments/paypal.service";
import { Order } from "../../../shared/classes/order";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";

@Component({
    selector: "app-isPayedSuccess",
    templateUrl: "./isPayedSuccess.component.html",
    styleUrls: ["./isPayedSuccess.component.scss"],
})
export class isPayedSuccessComponent implements OnInit {
    componentName: string = "isPayedSuccessComponent";
    currBreadCrumb: BreadcrumbObject[] = [{ title: "Successuly Payed", url: "/shop/checkout/paymentSuccess" }];

    orderDetails: Order = {};

    token: string | undefined;
    isPayed: boolean | undefined;
    finishedLoading: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private paypalService: PaypalService,
        private cartService: CartService) { }

    async ngOnInit(): Promise<void> {
        this.token = this.route.snapshot.paramMap.get("token");

        try {
            const resp = await this.paypalService.CheckSuccess(this.token);

            if (resp.length) {
                this.isPayed = true;
                await this.cartService.ClearCart();
                this.cartService.updateCart();
            }
            else this.isPayed = false;


            this.finishedLoading = true;
        } catch (error) {
            // Handle errors as needed
            console.error('Error during PayPal payment check:', error);
            this.finishedLoading = true; // Set this to true even if there's an error to avoid the setTimeout logic
        }

        // setTimeout is not needed anymore
    }


}
