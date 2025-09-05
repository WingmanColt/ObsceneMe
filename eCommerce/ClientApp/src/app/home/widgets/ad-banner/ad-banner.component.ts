import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

declare const gsap: any;
declare const SplitText: any;
declare const lazySizes: any;

@Component({
  selector: 'app-ad-banner',
  templateUrl: './ad-banner.component.html',
  styleUrl: './ad-banner.component.scss'
})
export class AdBannerComponent implements OnInit, OnDestroy {
  private tl: any = null;
  private splittext: any = null;
  private img: HTMLImageElement | null = null;
  

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.img = this.el.nativeElement.querySelector('.image-with-text-overlay--bg img');
    
    if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
      this.prepareAnimations();
    }

    window.addEventListener('load', () => {
      if (this.img) {
        lazySizes.loader.unveil(this.img);
      }
    });
  }

  ngOnDestroy(): void {
    if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
      this.tl?.kill();
      this.splittext?.revert();
    }
  }

  private prepareAnimations(): void {
    const section = this.el.nativeElement;
    let property = gsap.getProperty('html', '--header-height') + gsap.getProperty('html', '--header-offset') + 'px';

    this.tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top center',
      },
    });

    document.fonts.ready.then(() => {
      gsap.set(section.querySelectorAll('.image-with-text-overlay--content-inner'), { visibility: 'visible' });
      
      this.splittext = new SplitText(section.querySelectorAll('.image-with-text-overlay--heading, .rte p'), {
        type: 'lines',
        linesClass: 'line-child',
      });

      const mask = new SplitText(section.querySelectorAll('.image-with-text-overlay--heading, .rte p'), {
        type: 'lines',
        linesClass: 'line-parent',
      });
      
      this.tl.from(section.querySelector('.image-with-text-overlay--bg'), { scale: 1.2, duration: 1 });
      this.tl.fromTo(section.querySelector('.inline-badge'), { opacity: 0 }, { duration: 0.25, opacity: 1 }, '>-0.3');
      this.tl.fromTo(section.querySelector('.subheading'), { opacity: 0 }, { duration: 0.5, opacity: 1 }, '>-0.3');
      this.tl.from(section.querySelectorAll('.image-with-text-overlay--heading .line-child'), { duration: 0.75, yPercent: 100, stagger: 0.05, rotation: '2deg' }, '>-0.3');
      this.tl.from(section.querySelectorAll('.rte p .line-child'), { duration: 0.5, yPercent: 100, stagger: 0.02 }, '>-0.3');

      const buttons = section.querySelectorAll('.button');
      if (buttons) {
        let i = 1;
        buttons.forEach((item: HTMLElement) => {
          this.tl.fromTo(item, { autoAlpha: 0 }, { duration: 0.5, autoAlpha: 1 }, `>-=${(i - 1) * 0.1}`);
          i++;
        });
      }
    });

    const parallaxImage = section.querySelector('.thb-parallax-image');
    if (parallaxImage) {
      gsap.fromTo(parallaxImage, { y: '-8%' }, {
        y: '8%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          scrub: 1,
          start: () => 'top bottom',
          end: () => `bottom top+=${property}`,
          onUpdate: () => {
            property = gsap.getProperty('html', '--header-height') + gsap.getProperty('html', '--header-offset') + 'px';
          },
        },
      });
    }
  }
}
