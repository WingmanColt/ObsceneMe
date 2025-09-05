import { Component } from "@angular/core";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";

@Component({
 selector: "app-cancel",
 templateUrl: "./cancel.component.html",
 styleUrls: ["./cancel.component.scss"],
})
export class CancelComponent {
 currBreadCrumb: BreadcrumbObject[] = [{ title: "Forbidden 404", url: "/shop/checkout/404" }];

 constructor() {}
}
