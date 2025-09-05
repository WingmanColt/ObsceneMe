import { Component, Input } from "@angular/core";
import { environment } from "environments/environment";
import { Images } from "src/app/shared/classes/product";

@Component({
 selector: "app-progress-bar",
 templateUrl: "./progress-bar.component.html",
 styleUrls: ["./progress-bar.component.scss"],
})
export class ProgressBarComponent {
 @Input() thumbImages: Images[];
 @Input() class: string;

 @Input() onMouseEnter: any;
 @Input() onMouseLeave: any;
 defaultImage: string = environment.placeholderSrc;

 hover: boolean = false;
 currentImageIndex: number = 0;
 intervalId: any;

 OnMouseEnter(): void {
  this.hover = true;
  this.startImageRotation();
 }

 OnMouseLeave(): void {
  this.hover = false;
  this.stopImageRotation();
 }

 startImageRotation(): void {
  this.intervalId = setInterval(() => {
   this.currentImageIndex = (this.currentImageIndex + 1) % this.thumbImages?.length;
  }, 1000);
 }

 stopImageRotation(): void {
  clearInterval(this.intervalId);
 }
}
