import { isPlatformBrowser } from "@angular/common";
import {
  Component,
  Input,
  ViewChild,
  OnDestroy,
  TemplateRef,
  Inject,
  PLATFORM_ID,
  OnInit,
  RendererFactory2,
  Renderer2,
  HostListener,
} from "@angular/core";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-gallery-modal",
  templateUrl: "./gallery-modal.component.html",
  styleUrls: ["./gallery-modal.component.scss"],
})
export class GalleryModalSwiperComponent implements OnInit, OnDestroy {
  @Input() imageObjects: object[];

  @ViewChild("galleryModal", { static: false }) GalleryModal: TemplateRef<any>;

  public closeResult: string;
  public modalOpen: boolean = false;
  
  renderer: Renderer2;
  activeIndex: number = 0;

  private scrollPosition = 0;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private modalService: NgbModal, private rendererFactory: RendererFactory2) {

    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    
  }

  openModal(index: number) {
    this.activeIndex = index;
    
    this.modalOpen = true;
    this.disableScroll();

    if (isPlatformBrowser(this.platformId)) {
      // For SSR
      this.modalService
        .open(this.GalleryModal, {
          size: "xxl",
          ariaLabelledBy: "galleryModal",
          centered: true,
          windowClass: "SimpleGalleryModal", // GalleryModal old one
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
      this.enableScroll();
    }
  }

  close(){
    this.modalService.dismissAll();
    this.enableScroll();
    this.modalOpen = false;
  }

@HostListener('window:resize')
onResize() {
  this.scrollPosition = window.scrollY;
}

private disableScroll() {
  this.scrollPosition = window.scrollY;
  this.renderer.setStyle(document.body, 'position', 'fixed');
  this.renderer.setStyle(document.body, 'top', `-${this.scrollPosition}px`);
}

public enableScroll() {
  this.renderer.removeStyle(document.body, 'position');
  this.renderer.removeStyle(document.body, 'top');
  window.scrollTo(0, this.scrollPosition);
}
}
