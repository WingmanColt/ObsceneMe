import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { environment } from "environments/environment";

@Component({
 selector: "app-pages",
 templateUrl: "./pages.component.html",
 styleUrls: ["./pages.component.scss"],
})
export class PagesComponent implements OnInit {
 public env = environment.pagesSettings;

 constructor() {}

 ngOnInit(): void {}
}
