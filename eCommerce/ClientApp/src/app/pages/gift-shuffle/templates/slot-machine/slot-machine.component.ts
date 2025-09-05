import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { gsap, ScrollTrigger } from "gsap/all";
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { Products } from 'src/app/shared/classes/product';
import { ProductListing } from 'src/app/shared/classes/productListing';
import { ProductSearch } from 'src/app/shared/classes/productSearch';

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrl: './slot-machine.component.scss'
})
export class SlotMachineComponent implements OnInit, AfterViewInit, OnDestroy {
  componentName: string = "SlotMachineComponent";

  items1: any[];
  items2: any[];
  items3: any[];

  textContent: HTMLElement;
  activeItem1: string;
  activeItem2: string;
  activeItem3: string;

  searchParams: ProductSearch = { pageNumber: 1, pageSize: 25, minPrice: 0, maxPrice: 99999 }; // Initial fetch size: 25
  products: Products[] = [];
  private destroy$ = new Subject<void>(); // Subject for managing component destruction

  constructor(
    private renderer: Renderer2,
    private productService: ProductsService) {
  }


  ngOnInit(): void {
   /* this.productService.getProductListing(this.searchParams).pipe( 
      takeUntil(this.destroy$))
     .subscribe((response: ProductListing) => {
      console.log(response)
      this.products = response.product;

     if(response.product?.length) {
      this.splitItems();
     } 

   });*/
  }


  ngAfterViewInit() {
    this.textContent = document.getElementById('textcontent');
    gsap.registerPlugin(ScrollTrigger);
    this.initializeWheels();
  }

  splitItems() {
    const totalItems = this.products.length;
    const itemsPerSlot = Math.ceil(totalItems / 3);

    this.items1 = this.products.slice(0, itemsPerSlot);
    this.items2 = this.products.slice(itemsPerSlot, itemsPerSlot * 2);
    this.items3 = this.products.slice(itemsPerSlot * 2, totalItems);

    console.log(this.items1)
    console.log(this.items2)
    console.log(this.items3)
  }

  initializeWheels() {
    const random1 = gsap.utils.random(-360, 360, 36);
    const random2 = gsap.utils.random(-360, 360, 36);
    const random3 = gsap.utils.random(-360, 360, 36);

    gsap
      .timeline({ onComplete: this.finishScroll.bind(this) })
      .set('.ring', { rotationX: -90 })
      .set('.slot-item', {
        rotateX: (i) => i * -36,
        transformOrigin: '50% 50% -220px',
        z: 220,
      })
      .to('#ring1', { rotationX: random1, duration: 1, ease: 'power3' }, '<=')
      .to('#ring2', { rotationX: random2, duration: 1.5, ease: 'power3' }, '<=')
      .to('#ring3', { rotationX: random3, duration: 2, ease: 'power3' }, '<=');

    const items = document.querySelectorAll('.slot-item');

    console.log(items)
    items.forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item,
        scroller: '.console-outer',
        start: 'top center-=59px',
        end: 'bottom center-=59px',
        toggleClass: 'active',
      });
    });

  }

  finishScroll() {
    const items = document.querySelectorAll('.slot-item');
    console.log(items)
    items.forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item,
        scroller: '.console-outer',
        start: 'top center-=59px',
        end: 'bottom center-=59px',
      //  toggleClass: 'active',
      });
    });

    this.activeItem1 = this.getActiveItemDataContent('#col1 .slot-item.active');
    this.activeItem2 = this.getActiveItemDataContent('#col2 .slot-item.active');
    this.activeItem3 = this.getActiveItemDataContent('#col3 .slot-item.active');

    if (document.querySelector('.notstarted')) { }
    else {
      if (this.activeItem1 === this.activeItem2 && this.activeItem2 === this.activeItem3) {
        this.textContent.innerHTML = `<p>You won, woohoo! Everyone gets ${this.activeItem1}s!</p>`;
      } else if (this.activeItem1 != this.activeItem2 && this.activeItem2 != this.activeItem3 && this.activeItem1 != this.activeItem3) {
        this.textContent.innerHTML = '<p>Bad luck, you lost</p>';
      } else if (this.activeItem1 === this.activeItem2 && this.activeItem1 != this.activeItem3 && this.activeItem2 != this.activeItem3) {
        this.textContent.innerHTML = `<p>Close but no ${this.activeItem1}s for you. Why not try again?</p>`;
      } else if (this.activeItem1 === this.activeItem3 && this.activeItem1 != this.activeItem2 && this.activeItem3 != this.activeItem2) {
        this.textContent.innerHTML = `<p>Close but no ${this.activeItem1}s for you. Why not try again?</p>`;
      } else if (this.activeItem2 === this.activeItem3 && this.activeItem1 != this.activeItem3 && this.activeItem1 != this.activeItem2) {
        this.textContent.innerHTML = `<p>Close but no ${this.activeItem3}s for you. Why not try again?</p>`;
      }
    }
  }

  spinWheels() {
    this.textContent.innerHTML = '<p>round and round it goes...</p>';
    this.renderer.removeClass(document.querySelector('.stage'), 'notstarted');

    // Using Renderer2 to manipulate elements
    document.querySelectorAll('.ring:not(.held) .slot-item').forEach((item) => {
      this.renderer.removeClass(item, 'active');
    });


    const random1 = gsap.utils.random(-1440, 1440, 36);
    const random2 = gsap.utils.random(-1440, 1440, 36);
    const random3 = gsap.utils.random(-1440, 1440, 36);

    const scrollCells = gsap.timeline({ paused: true, onComplete: this.finishScroll.bind(this) });

    scrollCells
      .to('#ring1:not(.held)', {
        rotationX: random1,
        duration: 2,
        ease: 'power3',
      }, '<')
      .to('#ring2:not(.held)', {
        rotationX: random2,
        duration: 3,
        ease: 'power3',
      }, '<')
      .to('#ring3:not(.held)', {
        rotationX: random3,
        duration: 4,
        ease: 'power3',
      }, '<');

    scrollCells.play();
  }

  toggleHold(ringId: string) {
    const buttonHold = document.querySelector(`button.hold[data-controls="${ringId}"]`);
    buttonHold?.classList.toggle('held');
    if (buttonHold) {
      buttonHold.textContent = buttonHold.textContent === 'Hold' ? 'Held' : 'Hold';
    }

    const ringToHold = document.getElementById(ringId);
    ringToHold?.classList.toggle('held');
  }

  getActiveItemDataContent(selector: string): string {
    const activeItem = document.querySelector(`${selector}.active`);
    return activeItem ? activeItem.getAttribute('data-content') || '' : '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}