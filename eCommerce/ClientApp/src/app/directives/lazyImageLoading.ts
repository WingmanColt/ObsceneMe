import { Directive, ElementRef, Input, AfterViewInit } from "@angular/core";

@Directive({
 selector: "[imageLazyLoad]",
 standalone: true,
})
export class LazyLoadDirective implements AfterViewInit {
 @Input("imageLazyLoad") src: string;

 constructor(private el: ElementRef) {}

 ngAfterViewInit() {
  const obs = new IntersectionObserver((entries) => {
   entries.forEach(({ isIntersecting }) => {
    if (isIntersecting) {
     const img = this.el.nativeElement;
     img.src = this.src;
     obs.unobserve(img);
    }
   });
  });
  obs.observe(this.el.nativeElement);
 }
}
