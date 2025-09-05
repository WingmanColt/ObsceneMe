import { Component, Input } from "@angular/core";
import { Products } from "src/app/shared/classes/product";

@Component({
 selector: "app-collection-result",
 templateUrl: "./results.component.html",
 styleUrls: ["./results.component.scss"],
})
export class ResultsComponent {
 @Input() products: Products[] = [];
 @Input() grid: string;
 @Input() colClass: string;
 @Input() settings: string;
 @Input() isMobile: boolean | undefined;
 @Input() animToBottom: boolean | undefined;

 constructor() {}

getGridClass() {
 return typeof this.grid === 'string' ? [this.grid] : this.grid || [];
}
trackByProductId(index: number, product: Products): number {
 return product.id;
}
}
