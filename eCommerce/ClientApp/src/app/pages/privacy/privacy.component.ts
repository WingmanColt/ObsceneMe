import { Component } from "@angular/core";
import { environment } from "environments/environment";
import { BreadcrumbObject } from "src/app/shared/components/breadcrumb/breadcrumb.component";

@Component({
 selector: "app-privacy",
 templateUrl: "./privacy.component.html",
 styleUrls: ["./privacy.component.scss"],
})
export class PrivacyComponent {
 enabled = environment.pagesSettings.PrivacySettings.PrivacyPageEnable;
 settings = environment.pagesSettings.PrivacySettings.Privacy;
 env = environment;

 currBreadCrumb: BreadcrumbObject[] = [{ title: "Privacy Policy", url: "/pages/privacy" }];
 
}
