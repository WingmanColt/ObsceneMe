import { Component } from "@angular/core";
import { environment } from "environments/environment";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";

@Component({
 selector: "app-faq",
 templateUrl: "./faq.component.html",
 styleUrls: ["./faq.component.scss"],
})
export class FaqComponent {
 enabled = environment.pagesSettings.FAQSettings.FAQPageEnable;
 settings = environment.pagesSettings.FAQSettings.FAQ;
 env = environment;

 currBreadCrumb: BreadcrumbObject[] = [{ title: "FAQ", url: "/pages/faq" }];
 
}
