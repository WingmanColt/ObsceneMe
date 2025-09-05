import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
} from "@angular/core";
import { environment } from "environments/environment";
import { GalleryModalSwiperComponent } from "../../gallery-modal/gallery-modal.component";
import { SimpleSliderComponent2 } from "src/app/shared/slider/simple-slider.component";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { Product } from "src/app/shared/classes/product";
import { BaseService } from "src/app/Services/base.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-slider-gallery-product",
  templateUrl: "./slider-gallery-product.component.html",
  styleUrls: ["./slider-gallery-product.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderGalleryProductComponent implements OnInit, OnDestroy {
  env = environment;

  @Input() imageObjects: any[];
  @Input() product: Product;
  @Input() categoryTitle: string;
  @Input() activeImage: string;

  isMobile: boolean;
  activeIndex: number;

  @ViewChild('ProductMainSlider') MainSlider: SimpleSliderComponent2;
  sliderConfigMain: any = {
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000, 
    changeToClickedSlide: true,
    navEnabled: true,
    navHoverable:true,
    navPosition: 'centered',
    breakpoints: {
      mobile: { paginationEnabled:true, paginationPosition:'thumbs-bottom', slideWidth: 100, slidesPerView: 1, slidesToSlide: 1 },
      tablet: { paginationEnabled:true, paginationPosition:'thumbs-bottom', slideWidth: 100, slidesPerView: 1, slidesToSlide: 1 },
      desktop: { paginationEnabled:true, paginationPosition:'thumbs-bottom',  slideWidth: 100, slidesPerView: 1, slidesToSlide: 1 }
    }
  };

  @ViewChild('ProductThumbsSlider') ThumbsSlider: SimpleSliderComponent2;
  sliderConfigThumbs: any = {
    slideChangeDelay: 50,
    draggable: false,
    delay: 5000, 
    changeToClickedSlide: true,
    navEnabled: true,
    navHoverable: false,
    navPosition: 'centered',
    breakpoints: {
      mobile: { slideWidth: 20, slidesPerView: 5 },
      tablet: { slideWidth: 20, slidesPerView: 5 },
      desktop: { slideWidth: 15, slidesPerView: 5 }
    }
  };


  @ViewChild("galleryModal") GalleryModal:
    | GalleryModalSwiperComponent
    | undefined;

  constructor(private sanitizer: DomSanitizer, public baseService: BaseService, private device: BreakpointDetectorService) {}


  ngOnInit(): void {
    this.isMobile = this.device.isDevice("Mobile");

    this.sliderConfigMain.slides = this.imageObjects;
    this.sliderConfigThumbs.slides = this.imageObjects;
  }

  ngAfterViewInit(): void {     
    if(this.MainSlider)
      this.MainSlider.handleOnSlideClick(this.activeIndex); 

    if(this.ThumbsSlider)
      this.ThumbsSlider.handleOnSlideClick(this.activeIndex);
  }

  onSlideChangeMain($event:number) {
    this.ThumbsSlider.handleOnSlideClick($event); 
  }

  onSlideChangeThumbs($event) {
    this.MainSlider.handleOnSlideClick($event); 
  }

  ngOnDestroy(): void {
    if(this.MainSlider)
      this.MainSlider.sliderDestroy(); 

    if(this.ThumbsSlider)
      this.ThumbsSlider.sliderDestroy();
  }

  resetMainImage() {
    this.activeImage = "";
  }

  
}
