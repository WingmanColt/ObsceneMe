import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ViewChild,
  ChangeDetectionStrategy,
} from "@angular/core";
import { GalleryModalSwiperComponent } from "../gallery-modal/gallery-modal.component";
import { environment } from "environments/environment";

@Component({
  selector: "app-thumb-pictures-swiper",
  templateUrl: "./thumbs-pictures.component.html",
  styleUrls: ["./thumbs-pictures.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ThumbPicturesSwiperComponent implements OnInit {
  @Input() imageObjects: Array<object>;
  @Input() alt: string;
  @Input() modalAvaliable: boolean;

  sliderConfig: any = {
    slideChangeDelay: 50,
    title:'Снимки',
    draggable: true,
    delay: 5000, 
    loop: 2,
    layoutMode:'mode-two',
    breakpoints: {
      mobile: { slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
      tablet: { slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
      desktop: { autoplay:true, slideWidth: 10, slidesPerView: 5, slidesToSlide: 5 }
    }
  };

  env = environment;
  defaultImage: string = this.env.placeholderSrc;
  imageLoading: number = 1;

  @ViewChild("galleryModal") GalleryModal: GalleryModalSwiperComponent;

  constructor() {
  }
  ngOnInit(): void {
    this.sliderConfig.slides = this.imageObjects;
  }

  onImageLoad(): void {
    this.imageLoading = 0;
  }

  onImageError(): void {
    this.imageLoading = 2;
  }

  getImageSrc(imageSrc: string): string {
    // Check if the image source is a valid URL or local path and return accordingly
    return imageSrc.startsWith("http") ? imageSrc :  `assets/images/reviews/${imageSrc}`;
  }
}
