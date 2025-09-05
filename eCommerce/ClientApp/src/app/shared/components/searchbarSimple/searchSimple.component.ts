import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { environment } from "environments/environment";
import { SearchService } from "src/app/Services/Search/search.service";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";

@Component({
 selector: "app-searchbarSimple",
 templateUrl: "./searchSimple.component.html",
 styleUrls: ["./searchSimple.component.scss"],
})
export class SearchBarSimpleComponent {
 @Output() isOpen = new EventEmitter<boolean>();

 env = environment;
 searchResult$: Observable<any>;

 private searchTimeout: any = null; // Stores the timeout reference
 private debounceTime = 1000; // Delay in milliseconds

 constructor(public translate: TranslateService, private searchService: SearchService) {}

 searchReq(value: string) {
  if (!value) return;

  clearTimeout(this.searchTimeout); // Clear the existing timeout

  this.searchTimeout = setTimeout(() => {
   this.searchService.updateSearchSimple(value);
 }, this.debounceTime);
 }

}