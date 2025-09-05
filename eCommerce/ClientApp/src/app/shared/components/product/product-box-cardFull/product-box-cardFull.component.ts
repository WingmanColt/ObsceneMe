import { Component, Input, ViewChild, ElementRef } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { MarketStatus, Products } from "../../../classes/product";
import SwiperCore, { Swiper } from "swiper";
import { swiperHomeProductsBigConfig, swiperHomeProductsThumbConfig } from "src/app/configs/swiperConfig";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";

SwiperCore.use(swiperHomeProductsThumbConfig.modules);

@Component({
 selector: "app-product-box-cardFull",
 templateUrl: "./product-box-cardFull.component.html",
 styleUrls: ["./product-box-cardFull.component.scss"],
})
export class ProductBoxCardFullComponent {
 @Input() product: Products;

 @ViewChild("el") element: ElementRef;
 @ViewChild("quickView") QuickView: QuickViewComponent;

 defaultImage: string = environment.placeholderSrc;
 MarketStatus = MarketStatus;

 public swiperThumbs: any = {};
 public swiperBig: any = {};

 public swiperThumbConfig = swiperHomeProductsThumbConfig;
 public swiperBigConfig = swiperHomeProductsBigConfig;

 constructor(public baseService: BaseService) {}

 MarketStatusEnum(item: MarketStatus) {
  return this.product.marketStatus === item;
 }

 onSwiperThumbs(swiper: Swiper) {
  this.swiperThumbs = swiper;
  swiper.update();
 }

 onSwiperBig(swiper: Swiper) {
  this.swiperBig = swiper;
  swiper.update();
 }

 SlideTo(index: number) {
  if (!this.swiperBig && !isNaN(index)) return;

  this.swiperBig.slideTo(index);
  this.swiperBig.update();
 }

 onSlideChange() {
  if (!this.swiperBig) return;

  for (var i = 0; i < this.swiperBig.slides.length; i++) {
   var slideProgress = this.swiperBig.slides[i].progress;

   var innerOffset = this.swiperBig.width * 0.5;
   var innerTranslate = slideProgress * innerOffset;
   this.swiperBig.slides[i].querySelector(".slide-inner").style.transform = "translate3d(" + innerTranslate + "px, 0, 0)";
  }
 }
}
