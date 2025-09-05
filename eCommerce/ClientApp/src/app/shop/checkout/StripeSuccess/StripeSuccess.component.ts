import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CartService } from "../../../Services/Cart/cart.service";
import { StripeService } from "../../../Services/Payments/stripe.service";
import { Order } from "../../../shared/classes/order";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";

@Component({
    selector: "app-StripeSuccess",
    templateUrl: "./StripeSuccess.component.html",
    styleUrls: ["./StripeSuccess.component.scss"],
})
export class StripeSuccessComponent implements OnInit {
    componentName: string = "StripeSuccessComponent";
    currBreadCrumb: BreadcrumbObject[] = [{ title: "Successuly Payed", url: "/shop/stripeSuccess" }];

    orderDetails: Order = {};

    token: string | undefined;
    isPayed: boolean | undefined;
    finishedLoading: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private stripeService: StripeService,
        private cartService: CartService) { }

    async ngOnInit(): Promise<void> {
        this.token = this.route.snapshot.paramMap.get("session_id");

        try {
            const resp = await this.stripeService.CheckSuccess(this.token);

            if (resp.length) {
                this.isPayed = true;
                await this.cartService.ClearCart();
                this.cartService.updateCart();
            } else {
                this.isPayed = false;
            }

            this.finishedLoading = true;
        } catch (error) {
            // Handle errors as needed
            console.error('Error during Stripe payment check:', error);
            this.finishedLoading = true; // Set this to true even if there's an error to avoid the setTimeout logic
        }

    }
}
