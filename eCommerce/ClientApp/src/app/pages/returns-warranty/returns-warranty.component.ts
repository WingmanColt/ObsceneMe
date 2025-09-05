import { Component } from "@angular/core";
import { environment } from "environments/environment";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";

@Component({
 selector: "app-returns-warranty",
 templateUrl: "./returns-warranty.component.html",
 styleUrls: ["./returns-warranty.component.scss"],
})
export class ReturnsWarrantyComponent {
 enabled = environment.pagesSettings.ReturnsWarrantySettings.ReturnsWarrantyPageEnable;
 settings = environment.pagesSettings.ReturnsWarrantySettings.ReturnsWarranty;
 env = environment;

 currBreadCrumb: BreadcrumbObject[] = [{ title: "Returns & Warranty", url: "/pages/returns-warranty" }];
 
 constructor(public detect: BreakpointDetectorService) {}



}
