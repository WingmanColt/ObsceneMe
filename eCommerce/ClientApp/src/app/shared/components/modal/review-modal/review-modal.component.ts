import { Component, OnDestroy, ViewChild, TemplateRef, PLATFORM_ID, Inject, Input } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

@Component({
 selector: "app-review-modal",
 templateUrl: "./review-modal.component.html",
 styleUrls: ["./review-modal.component.scss"],
})
export class ReviewModalComponent implements OnDestroy {
 @Input() productId: number;
 @Input() icon: string;
 @Input() iconColor: string;
 @ViewChild("reviewModal", { static: false }) ReviewModal: TemplateRef<any>;

 public closeResult: string;
 public modalOpen: boolean = false;

 constructor(@Inject(PLATFORM_ID) private platformId: Object, private modalService: NgbModal) {}

 openModal() {
  this.modalOpen = true;

  if (isPlatformBrowser(this.platformId)) {
   // For SSR
   this.modalService
    .open(this.ReviewModal, {
     size: "lg",
     ariaLabelledBy: "review-modal",
     centered: true,
     scrollable: false,
     modalDialogClass: "review-dialog",
     windowClass: "ReviewModal",
    })
    .result.then(
     (result) => {
      `Result ${result}`;
     },
     (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
     }
    );
  }
 }

 private getDismissReason(reason: any): string {
  if (reason === ModalDismissReasons.ESC) {
   return "by pressing ESC";
  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
   return "by clicking on a backdrop";
  } else {
   return `with: ${reason}`;
  }
 }

 ngOnDestroy() {
  if (this.modalOpen) {
   this.modalService.dismissAll();
  }
 }
}
