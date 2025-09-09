import { Component, Input, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { OrderService } from "src/app/Services/Order/order.service";
import { FastOrder } from "src/app/shared/classes/fastOrder";
import { Products } from "src/app/shared/classes/product";
import { AlertModalComponent } from "src/app/shared/components/modal/alert-modal/alert-modal.component";
import { OperationResult } from "src/app/shared/interfaces/operationResult";

@Component({
    selector: "app-fast-order",
    templateUrl: "./fast-order.component.html",
    styleUrls: ["./fast-order.component.scss"],
})
export class FastOrderComponent {
    @Input() product: Products;
    @Input() col: string;
    @Input() isVariantSelected: boolean;
    @Input() isMobile: boolean;

    @ViewChild("fastOrderModal") FastOrderModal: AlertModalComponent | undefined;

    checkoutForm: UntypedFormGroup | undefined;
    isInCart: number = 0;

    constructor(
        private fb: UntypedFormBuilder, 
        private orderService: OrderService) {

        this.buildForm();
    }

    buildForm() {
        this.checkoutForm = this.fb.group({
            phone: ["", [Validators.required, Validators.pattern("[0-9]+")]],
        });
    }

    async onSubmit(order: FastOrder) {
        try {
            this.isInCart = 1;
            order.productId = this.product?.id;
            order.productTitle = this.product?.title;
            order.costPerItem = this.product?.price;
            order.discountPerItem = this.product?.discountRate;
            order.phone = this.checkoutForm?.value["phone"];

            const res: OperationResult = await this.orderService.CreateFast(order);

            if (res?.success) {
                this.isInCart = 2;
            } else {
                this.isInCart = 3;
                this.FastOrderModal.text = res.failureMessage;
            }
        } catch (error) {
            // Handle errors as needed
            console.error('Error during order creation:', error);
            this.isInCart = 3;
        }
    }



}
