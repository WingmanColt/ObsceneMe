import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { Products } from 'src/app/shared/classes/product';
import { ProductListing, ProductListingDetails } from 'src/app/shared/classes/productListing';
import { ProductSearch } from 'src/app/shared/classes/productSearch';

@Component({
  selector: 'app-gift-shuffle',
  templateUrl: './gift-shuffle.component.html',
  styleUrl: './gift-shuffle.component.scss'
})
export class GiftShuffleComponent implements OnInit, OnDestroy {
  merrywrapClass: string = 'merrywrap';
  step: number = 1;
  private stepMinutes: number[] = [500, 500, 500, 500, 500, 500, 5000, 5000];

  products: ProductListingDetails[] = [];
  searchParams: ProductSearch = { pageNumber: 1, pageSize: 25, minPrice: 0, maxPrice: 99999 }; // Initial fetch size: 25
  private destroy$ = new Subject<void>(); // Subject for managing component destruction


  constructor(private productService: ProductsService){
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
        
   /* this.productService.getProductListing(this.searchParams).pipe( 
      takeUntil(this.destroy$))
     .subscribe((response: ProductListing) => {
      this.products = response.product;
   });*/
  }

  private stepClass(step: number) {
    this.merrywrapClass = 'merrywrap'; // Reset class
    this.merrywrapClass = `step-${step}`;
  }

  openBox() {
    this.stepClass(this.step);

    if (this.step === 8) {
      return;
    }

    setTimeout(() => this.openBox(), this.stepMinutes[this.step - 1]);
    this.step++;
  }
}

/*
  cards: string[] = Array.from({ length: 3 }, (_, i) => `card ani${i}`);
animationDuration = 200;
openGift: boolean = false;
isStackClicked: boolean = false;
 
@ViewChildren('bubblyButtons') bubblyButtons: QueryList<ElementRef>;

ngOnInit(): void {
     this.onStackClick();
}

toggleGift(): void {
setTimeout(() => { 
  this.openGift = !this.openGift

  if (this.openGift) {
    this.onSpreadClick();
  } else {
    this.onStackClick();
  }
}
, 200);
 
}

onStackClick() {
  this.isStackClicked = true;
  this.cards.forEach((_, index) => {
    setTimeout(() => {
      this.cards[index] = 'card small-opacity';
    }, index * this.animationDuration);
  });

  // After 1 second, set opacity to 0
  setTimeout(() => {
    this.cards.forEach((_, index) => {
      this.cards[index] = 'card small-opacity fade-out';
    });
  }, 500);
}

onSpreadClick() {
  this.cards.forEach((_, index) => {
    setTimeout(() => {
      this.cards[index] = `card ani${index}`;
    }, index * this.animationDuration);
  });
}

onClick(button: any): void {
  button.classList.add('animate');

  setTimeout(() => {
  this.openGift = !this.openGift;
  if (this.openGift) {
    this.onSpreadClick();
  } else {
    this.onStackClick();
  }
  }, 700);

  setTimeout(() => {
    
    button.classList.remove('animate');
    button.classList.remove('active');
}, 700);
}
*/

