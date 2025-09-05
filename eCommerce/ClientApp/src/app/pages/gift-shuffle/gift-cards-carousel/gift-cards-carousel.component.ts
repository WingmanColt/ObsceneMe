import { Component, OnInit, HostListener, AfterViewInit, Input } from '@angular/core';
import { TweenMax, Expo, Quint } from 'gsap/all';
import { Products } from 'src/app/shared/classes/product';

@Component({
  selector: 'app-gift-cards-carousel',
  templateUrl: './gift-cards-carousel.component.html',
  styleUrls: ['./gift-cards-carousel.component.scss']
})
export class GiftCardsCarouselComponent implements OnInit, AfterViewInit {
  w: any;
  container: any;
  carousel: any;
  item: any;
  radius: number;
  itemLength: number;
  rY: number;
  ticker: any;
  mouseX = 0;
  mouseY = 0;
  mouseZ = 0;
  addX = 0;
  fpsCounter: any;
  fpsText: string = 'Framerate: 0/60 FPS';

  private rotationTweens: TweenMax[] = []; // Store rotation tweens
  @Input() products: Products[] = [];

  constructor() {
    this.fpsCounter = {
      times: [],
      span: 20,
      tick: function () {
        this.times = this.times.concat(+new Date());
        let seconds, times = this.times;
        if (times.length > this.span + 1) {
          times.shift();
          seconds = (times[times.length - 1] - times[0]) / 1000;
          return Math.round(this.span / seconds);
        } else return null;
      }
    };
  }
  ngAfterViewInit(): void {
    this.init();
  }

  ngOnInit() {
    // this.init();
  }

  init() {
    this.w = window;
    this.container = document.getElementById('contentContainer');
    this.carousel = document.getElementById('carouselContainer');
    this.item = document.getElementsByClassName('carouselItem');
    this.itemLength = this.products.length;
    this.rY = 360 / this.itemLength;
    this.radius = Math.round((250) / Math.tan(Math.PI / this.itemLength));

    TweenMax.set(this.container, { perspective: 600 });
    TweenMax.set(this.carousel, { z: -this.radius });

    for (let i = 0; i < this.itemLength; i++) {
      const item = this.item[i];
      const block = item.getElementsByClassName('carouselItemInner')[0];

      const rotationTween = TweenMax.to(block, 1, { rotationY: 0, rotationX: 0, z: 0, ease: Expo.easeInOut, paused: true });
      this.rotationTweens.push(rotationTween);

      TweenMax.set(item, { rotationY: this.rY * i, z: this.radius, transformOrigin: `50% 50% ${-this.radius}px` });
      this.animateIn(item, block);
    }

    this.ticker = setInterval(() => this.looper(), 1000 / 60);
  }

  animateIn(item: any, block: any) {
    const nrX = 360 * this.getRandomInt(2);
    const nrY = 360 * this.getRandomInt(2);
    const nx = -(2000) + this.getRandomInt(4000);
    const ny = -(2000) + this.getRandomInt(4000);
    const nz = -4000 + this.getRandomInt(4000);
    const s = 1.5 + (this.getRandomInt(10) * 0.1);
    const d = 1 - (this.getRandomInt(8) * 0.1);

    TweenMax.set(item, { autoAlpha: 1, delay: d });
    TweenMax.set(block, { z: nz, rotationY: nrY, rotationX: nrX, x: nx, y: ny, autoAlpha: 0 });
    TweenMax.to(block, s, { delay: d, rotationY: 0, rotationX: 0, z: 0, ease: Expo.easeInOut });
    TweenMax.to(block, s - 0.5, { delay: d, x: 0, y: 0, autoAlpha: 1, ease: Expo.easeInOut });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = -(-(window.innerWidth * 0.5) + event.pageX) * 0.0025;
    this.mouseY = -(-(window.innerHeight * 0.5) + event.pageY) * 0.01;
    this.mouseZ = -(this.radius) - (Math.abs(-(window.innerHeight * 0.7) + event.pageY) - 200);
  }

  looper() {
    this.addX += this.mouseX;
    TweenMax.to(this.carousel, 1, { rotationY: this.addX, rotationX: this.mouseY, ease: Quint.easeOut });
    TweenMax.set(this.carousel, { z: this.mouseZ });
    this.fpsText = 'FPS: ' + this.fpsCounter.tick() + '/60';
  }

  spinCarousel() {
    // Define the rotation angle for spinning the carousel
    const spinAngle = 360;

    // Calculate the new rotation angle by adding the spin angle to the current rotation
    const newRotation = this.addX + spinAngle;

    // Animate the rotation of the carousel to the new angle
    TweenMax.to(this.carousel, 1, { rotationY: newRotation, ease: Quint.easeOut });
  }
  getRandomInt(n: number) {
    return Math.floor((Math.random() * n) + 1);
  }

  pauseRotationAnimations() {
    this.rotationTweens.forEach(tween => tween.pause());
  }

  resumeRotationAnimations() {
    this.rotationTweens.forEach(tween => tween.play());
  }
}
