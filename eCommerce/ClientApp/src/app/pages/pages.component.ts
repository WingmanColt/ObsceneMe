import { Component } from "@angular/core";
import { environment } from "environments/environment";

@Component({
 selector: "app-pages",
 templateUrl: "./pages.component.html",
 styleUrls: ["./pages.component.scss"],
})
export class PagesComponent {
 public pagesSetting = environment.pagesSettings;
 public homeType = environment.homeSettings.homeType;
}
