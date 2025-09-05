import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "environments/environment";
import { ProductDetails } from "src/app/shared/classes/productDetails";

@Component({
 selector: "app-about-section",
 templateUrl: "./about-section.component.html",
 styleUrls: ["./about-section.component.scss"],
})
export class AboutSectionComponent implements OnInit {
 detailsSettings = environment.pagesSettings.DetailsSettings;
 aboutSectionType: string;

 @Input() product: ProductDetails = {};
 @Input() isMobile: boolean;
 @Output() reviewsModal = new EventEmitter<any>();

 tabs = [
  {
   title: "About",
   activeTabIndex: 1,
  }
 ];
 
 activeTab = this.tabs[0];
 selectedAccordion: string = 'flush-collapseSix';

 constructor(private _sanitizer: DomSanitizer) {}
 ngOnInit(): void {
  this.aboutSectionType = !this.isMobile ? this.detailsSettings.aboutSection : this.detailsSettings.aboutSectionMobile;
 

  if (this.product.characteristic) {
   this.tabs.push({
    title: "Characteristic",
    activeTabIndex: 2,
   });
 }

  if (this.product.usage) {
   this.tabs.push({
    title: "Method Of Use",
    activeTabIndex: 3,
   });
 }

 if (this.product.composition) {
  this.tabs.push({
   title: "Composition",
   activeTabIndex: 4,
  });
}

  if (this.product.videoUrl) {
   this.tabs.push({
     title: "Video",
     activeTabIndex: 5,
   });
 }
 }

 selectTab(tab: any) {
  this.activeTab = tab;
 }
 openReviewModal() {
  this.reviewsModal.emit();
 }

 getTextSanitized(text: string) {
  if (this.product) {
   return this._sanitizer.bypassSecurityTrustHtml(text);
  }

  return null;
 }

 toggleAccordion(accordionId: string) {
  if (this.selectedAccordion === accordionId) {
    this.selectedAccordion = null; // Close the accordion if it's already open
  } else {
    this.selectedAccordion = accordionId; // Open the accordion
  }
}

isAccordionSelected(accordionId: string): boolean {
  return this.selectedAccordion === accordionId;
}
}
