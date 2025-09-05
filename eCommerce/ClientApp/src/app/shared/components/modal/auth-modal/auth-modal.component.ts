import { Component, OnDestroy, ViewChild, TemplateRef, PLATFORM_ID, Inject, RendererFactory2, Renderer2, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { AuthResponse, ResendVerify } from 'src/app/shared/classes/account';
import { AccountService } from 'src/app/Services/Account/account.service';
import { UserAccountModalService } from 'src/app/Services/Modal/userAccountModal.service';
import { BaseService } from 'src/app/Services/base.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, OnDestroy {
  componentName: string = "AuthModalComponent";
  settings = environment;

  closeResult: string;
  pageName: string = 'LoginPage';

  userData: ResendVerify;
  renderer: Renderer2;

  currentUser: AuthResponse | undefined;
  modalOpen: boolean = false;
  verified: boolean = false;
  withVerification: boolean;
  private destroy$ = new Subject<void>();

  @ViewChild("authModal", { static: false }) authModal: TemplateRef<any>;
  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private modalService: NgbModal,
    private baseService: BaseService,
    private accountModalService: UserAccountModalService,
    private rendererFactory: RendererFactory2,
    public accountService: AccountService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }
     
  private initSubscriptions() {
    this.accountService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user ?? undefined;
   });

    this.accountModalService.showModal$.pipe(takeUntil(this.destroy$)).subscribe((props) => {
      this.modalOpen = props?.page?.length > 0 ? true : false;

      if (this.modalOpen) {
         this.pageName = props?.page;
         this.withVerification = props?.withVerification;
         this.openModal();
      }
      else {
        this.CloseModal();
        this.pageName = 'LoginPage';
      }
    });

  }

  openModal() {
    if (isPlatformBrowser(this.platformId)) { // For SSR 
      this.modalService.open(this.authModal, {
        size: 'md',
        ariaLabelledBy: 'Auth-Modal',
        centered: true,
        windowClass: 'AuthModal2'
      }).result.then((result) => {

        this.modalOpen = true;
        this.setOverflow(true);

        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
    //}
  }

  private getDismissReason(reason: any): string {
    this.accountModalService.closeModal();
    this.baseService.updateMenuState({isUserPanelOpen: false});

    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  switchPage($event: string) {
    this.pageName = $event;
  }
  handleUserData($event: ResendVerify) {
    this.userData = $event;
  }

  CloseModal($event?: boolean) {
    this.verified = $event;

    if (this.modalOpen) {
      this.resetModal()
      this.setOverflow(false);
    }
  }

  private setOverflow(set: boolean): void {
    return set ? this.renderer.setStyle(document.documentElement, "overflow", "hidden") : this.renderer.removeStyle(document.documentElement, "overflow");
  }

 ngOnDestroy(): void {
  if (this.modalOpen) 
    this.resetModal()

    this.destroy$.next();
    this.destroy$.complete();
  }
  resetModal(){
    this.accountModalService.closeModal();
    this.baseService.updateMenuState({isUserPanelOpen: false});
    this.modalService.dismissAll();
  }
}
