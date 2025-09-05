import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';
import { ProductsService } from 'src/app/Services/Product/products.service';

@Component({
  selector: 'app-swiper-categories-page',
  templateUrl: './swiper-categories-page.component.html',
  styleUrl: './swiper-categories-page.component.scss'
})
export class SwiperCategoriesPageComponent implements OnInit, OnDestroy {
  settings = environment.setting;

  private queryParamsSubscription: Subscription | undefined;
  subCategories: any[]; 

  sliderConfig: any = {
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000, 
    breakpoints: {
      mobile: { navEnabled: false, paginationEnabled:true, slideWidth: 50, slidesPerView: 2, slidesToSlide: 2 },
      tablet: { navEnabled: true, paginationEnabled:true, slideWidth: 30, slidesPerView: 3, slidesToSlide: 3 },
      desktop: { navEnabled: true, paginationEnabled:true, paginationPosition:'thumbs-bottom', autoplay:true, slideWidth: 20, slidesPerView: 5, slidesToSlide: 5 }
    }
  };

  constructor(private route: ActivatedRoute, private productService: ProductsService) { }

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      // Extract query parameters
      const categoryShortName = params['category'];

      if (categoryShortName) 
        this.loadCategoryData(categoryShortName);
    });

  }

  async loadCategoryData(shortname: string) {
    try {
      this.subCategories = await this.productService.getAllByCategory(shortname);
    } catch (error) {
      console.error('Error fetching subCategory data', error);
    }
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) 
      this.queryParamsSubscription.unsubscribe();
  }

}

