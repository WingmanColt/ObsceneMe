import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Order } from "../../../shared/classes/order";
import { OrderService } from "src/app/Services/Order/order.service";
import { CodService } from "src/app/Services/Payments/cod.service";
import { Currency } from "src/app/shared/classes/settings";
import { Invoice } from "src/app/shared/classes/invoice";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";
import { Token } from "src/app/shared/classes/token";
import { OperationResult } from "src/app/shared/interfaces/operationResult";

@Component({
    selector: "app-invoice",
    templateUrl: "./invoice.component.html",
    styleUrls: ["./invoice.component.scss"],
})
export class InvoiceComponent implements OnInit {
    componentName: string = "InvoiceComponent";
    currBreadCrumb: BreadcrumbObject[] = [{ title: "Invoice", url: "#" }];

    orderDetails: Order = {};

    code: string | undefined;
    token: string | undefined;
    loadingState: number = 0;

    activeCurrency: Currency;
    Invoice: Invoice | undefined;

    constructor(
        private route: ActivatedRoute,
        private orderService: OrderService,
        private codService: CodService) { }

    async ngOnInit(): Promise<void> {
        this.loadingState = 1;

        this.code = this.route.snapshot.paramMap.get("code");
        this.token = this.route.snapshot.paramMap.get("token");

        try{
        const res: OperationResult = await this.codService.CheckSuccess(new Token(this.token, this.code))

        if (res?.success) {
            await this.fetchInvoice(); 
            this.loadingState = 0;    
        } else this.loadingState = 2;  
      }
      catch(err) { 
            this.loadingState = 2;
        }

    }

    async fetchInvoice() {             
        try {
            const invoice: Invoice = await this.orderService.GetInvoice(this.code, this.token);
            if(invoice != null) {
            this.Invoice = invoice;   
            this.loadingState = 0;    
            }else this.loadingState = 2;
        }
        catch(err) { 
            this.loadingState = 2;
        }
    }


    updateCurrency(val: any) {
        return val.toFixed(2);
    }
}
