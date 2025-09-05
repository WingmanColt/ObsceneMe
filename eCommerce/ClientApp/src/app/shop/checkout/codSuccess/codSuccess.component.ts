import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CartService } from "../../../Services/Cart/cart.service";
import { Order } from "../../../shared/classes/order";
import { CodService } from "src/app/Services/Payments/cod.service";
import { environment } from "environments/environment";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";
import { Token } from "src/app/shared/classes/token";
import { OperationResult } from "src/app/shared/interfaces/operationResult";

@Component({
    selector: "app-codSuccess",
    templateUrl: "./codSuccess.component.html",
    styleUrls: ["./codSuccess.component.scss"],
})
export class codSuccessComponent implements OnInit {

    env = environment;
    currBreadCrumb: BreadcrumbObject[];
    orderDetails: Order = {};

    token: string | undefined;
    code: string | undefined;

    isPayed: boolean | undefined;
    finishedLoading: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cartService: CartService,
        private codService: CodService) { }

    async ngOnInit(): Promise<void> {
        this.code = this.route.snapshot.paramMap.get('code');
        this.token = this.route.snapshot.paramMap.get('token');

        try {
            const resp: OperationResult = await this.codService.CheckSuccess(new Token(this.token, this.code));

            if (resp.success) {
                this.isPayed = true;
                this.cartService.ClearCart();
            } else this.isPayed = false;


            this.finishedLoading = true;
        } catch (error) {
            // Handle errors as needed
            console.error('Error during initialization:', error);
            this.finishedLoading = true;
        }

        // setTimeout is not needed anymore
        this.currBreadCrumb = [
            { title: 'Order', url: '#' },
            { title: 'Code: ' + this.code, url: '#' },
        ];
    }

    getInvoice() {
        return this.router.navigate(["/shop/checkout/invoice", { code: this.code, token: this.token }]);
    }
}
