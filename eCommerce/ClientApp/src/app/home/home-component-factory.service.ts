// home-component-factory.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StyleTwoHomeComponent } from './style-two/style-two.component';
import { StyleBigSwiperHomeComponent } from './style-big-swiper/style-big-swiper.component';
import { SingleProductStyleComponent } from './single-product-style/single-product-style.component';

@Injectable({
  providedIn: 'root'
})
export class HomeComponentFactoryService {
  getHomeComponent() {
    const headerStyle = environment.homeSettings.homeType;
    
    if (headerStyle === 'BigSwiper') {
      return StyleBigSwiperHomeComponent;
    } else if (headerStyle === 'Style-Two') {
      return StyleTwoHomeComponent;
    }
    else if (headerStyle === 'Single-Product-Style') {
      return SingleProductStyleComponent;
    }
    // Default to one of the components if the headerStyle does not match
    return StyleBigSwiperHomeComponent;
  }
}
