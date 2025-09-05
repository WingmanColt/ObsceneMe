import { Injectable } from "@angular/core";
import { environment } from "environments/environment";

@Injectable({ providedIn: 'root' })
export class SliderStateService {
  slides = environment.swiperSettings.homeTwoSwiperSettings.SwiperArray;
  config = {
    slideWidth: 100,
    slidesPerView: 1,
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000,
    navEnabled: true,
    navHoverable: true,
    navPosition: 'centered',
    paginationEnabled: true,
    paginationPosition: 'thumbs-bottom',
    breakpoints: { desktop: { autoplay: true } }
  };
}
