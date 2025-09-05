import {Component, OnDestroy, ViewChild, TemplateRef, PLATFORM_ID, Inject, OnInit} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { DiscountModalService} from 'src/app/Services/Modal/modal.service';
import { SubscriptionTrackerService } from 'src/app/Services/Tracker/subscription-tracker.service';

@Component({
  selector: 'app-discount-modal',
  templateUrl: './discount-modal.component.html',
  styleUrls: ['./discount-modal.component.scss']
})
export class DiscountModalComponent implements OnInit, OnDestroy {
  componentName: string = "DiscountModalComponent";

  env = environment;
  public closeResult: string;
  public modalOpen: boolean = false;

  @ViewChild("discountModal", { static: false }) DiscountModal: TemplateRef<any>;
  constructor(@Inject(PLATFORM_ID) 
  private platformId: Object, 
  private modalService: NgbModal, 
  private subTracker: SubscriptionTrackerService,
  private discountModalService: DiscountModalService) {

  //this.initSubscriptions();
  }
  ngOnInit(): void {
     this.initSubscriptions();
  }

  private initSubscriptions() {
    const subAuthModal = this.discountModalService.showDiscountModal$.subscribe((isOpen: boolean) => {
      this.modalOpen = isOpen ? true : false;

      if (this.modalOpen) 
         this.openModal();     
      else 
         this.closeModal();    
    });

    this.subTracker.track({
      subscription: subAuthModal,
      name: "subAuthModal",
      fileName: this.componentName,
    });
  }


  openModal() {

    if (isPlatformBrowser(this.platformId)) { // For SSR 
      this.modalService.open(this.DiscountModal, {
        size: 'md',
        ariaLabelledBy: 'discount-modal',
        centered: true,
        scrollable: false,
        modalDialogClass: 'discount-dialog',
        windowClass: 'DiscountModal'
      }).result.then((result) => {
        `Result ${result}`
      }, async (reason) => {
       await this.discountModalService.setModalState(1);
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });

    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }

  }

  async redeem() {
    this.modalOpen = false;
    this.modalService.dismissAll();
    this.discountModalService.closeModal();

    setTimeout(async () => await this.discountModalService.setModalState(2), 2000)
  }

  /*ngOnDestroy() {
    if (this.modalOpen) {
      this.discountModalService.setModalState(0);
      this.modalService.dismissAll();
    }
  }*/

  
   async closeModal() {
    if (this.modalOpen) {
      this.discountModalService.closeModal();
      this.modalService.dismissAll();
      await this.discountModalService.setModalState(0);
    }
  }

  ngOnDestroy() {
    this.closeModal();
    this.subTracker.releaseAllForComponent(this.componentName);
  }


}
