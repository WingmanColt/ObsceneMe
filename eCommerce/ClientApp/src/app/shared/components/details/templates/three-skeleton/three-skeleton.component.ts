import { Component, Input, OnInit } from "@angular/core";

@Component({
 selector: "app-three-skeleton",
 templateUrl: "./three-skeleton.component.html",
 styleUrls: ["./three-skeleton.component.scss"],
})
export class ThreeSkeletonComponent implements OnInit {
 @Input() isMobile: boolean;
 cols: string;

 ngOnInit(): void {
  this.cols = this.isMobile ? "col-12" : "col-6";
 }
}
