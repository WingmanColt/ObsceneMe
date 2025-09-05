import { Component, Input } from "@angular/core";

export interface BreadcrumbObject {
 title: string;
 url: string;
 params?: { [key: string]: any }; // Optional property for query parameters
}

@Component({
 selector: "app-breadcrumb",
 templateUrl: "./breadcrumb.component.html",
 styleUrls: ["./breadcrumb.component.scss"],
})
export class BreadcrumbComponent {
 @Input() breadcrumbs: BreadcrumbObject[];
 @Input() title: string;

 constructor()  {
 }

 goBack(): void {
  window.history.back();
 }
}
