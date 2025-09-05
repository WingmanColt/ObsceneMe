import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  AfterViewInit,
  Renderer2,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[productImage]',
})
export class ProductImageDirective implements OnChanges, AfterViewInit {
  @Input('productImage') src: string;
  @Input() fallbackUrl: string;

  private hasLoaded: boolean = false;
  private resizeTimeout: any;

  private loaderElement: HTMLElement | null = null;
  private isImageTag: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.isImageTag = this.el.nativeElement.tagName === 'IMG';
    if (this.src) {
      this.setupImage();
    }
  }

  ngOnChanges(): void {
    if (this.src) {
      this.setupImage();
    }
  }

  @HostListener('window:resize')
onResize(): void {
  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout(() => {
    if (!this.hasLoaded) {
      this.setupImage();
    }
  }, 300);
}

private setupImage(): void {
  if (this.hasLoaded) {
    // Image already loaded, just set the src/background
    if (this.isImageTag) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.src);
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${this.src})`);
    }
    return;
  }

  this.addLoader();

  const deviceType = this.getDeviceType();
  const deviceSpecificImage = this.getImageName(this.src, deviceType);

  if (this.isImageTag) {
    this.lazyLoadImage(deviceSpecificImage, this.fallbackUrl || this.src);
  } else {
    this.lazyLoadBackgroundImage(deviceSpecificImage, this.fallbackUrl || this.src);
  }
}

  private lazyLoadImage(imageUrl: string, fallbackUrl: string): void {
    const imgElement = this.el.nativeElement as HTMLImageElement;

    // Set placeholder styles (blurred background)
    this.renderer.setStyle(imgElement, 'background-image', `url(${fallbackUrl})`);
    this.renderer.setStyle(imgElement, 'background-size', 'cover');
    this.renderer.setStyle(imgElement, 'background-position', 'center');
    this.renderer.setStyle(imgElement, 'filter', 'blur(5px)');
    this.renderer.setStyle(imgElement, 'opacity', '0.5');

    const tempImage = new Image();
    tempImage.onload = () => {
      this.hasLoaded = true; 

      this.renderer.setAttribute(imgElement, 'src', imageUrl);
      this.renderer.setStyle(imgElement, 'opacity', '1');
      this.renderer.setStyle(imgElement, 'filter', 'none');
      this.renderer.setStyle(imgElement, 'background-image', 'none'); // Remove background after loading
      this.removeLoader();
    };

    tempImage.onerror = () => {
      if (imageUrl !== fallbackUrl) {
        this.lazyLoadImage(fallbackUrl, fallbackUrl); // Retry with fallback
      } else {
        console.error(`Image could not be loaded: ${fallbackUrl}`);
        this.removeLoader();
        this.showErrorIcon();
      }
    };

    tempImage.src = imageUrl;
  }

  private lazyLoadBackgroundImage(imageUrl: string, fallbackUrl: string): void {
    const element = this.el.nativeElement;

    // Set placeholder background
    this.renderer.setStyle(element, 'background-image', `url(${fallbackUrl})`);
    this.renderer.setStyle(element, 'background-size', 'cover');
    this.renderer.setStyle(element, 'background-position', 'center');
    this.renderer.setStyle(element, 'filter', 'blur(5px)');
    this.renderer.setStyle(element, 'opacity', '0.5');

    const tempImage = new Image();
    tempImage.onload = () => {
      this.hasLoaded = true; 

      this.renderer.setStyle(element, 'background-image', `url(${imageUrl})`);
      this.renderer.setStyle(element, 'opacity', '1');
      this.renderer.setStyle(element, 'filter', 'none');
      this.removeLoader();
    };

    tempImage.onerror = () => {
      if (imageUrl !== fallbackUrl) {
        this.lazyLoadBackgroundImage(fallbackUrl, fallbackUrl);
      } else {
        console.error(`Background image could not be loaded: ${fallbackUrl}`);
        this.removeLoader();
        this.showErrorIcon();
      }
    };

    tempImage.src = imageUrl;
  }

  private getDeviceType(): string {
    const screenWidth = window.innerWidth;
    if (screenWidth < 500) return 'small';
    if (screenWidth >= 500 && screenWidth < 800) return 'normal';
    return '';
  }

  private getImageName(src: string, deviceType: string): string {
    const fileName = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));
    const extension = src.substring(src.lastIndexOf('.'));
    const basePath = src.substring(0, src.lastIndexOf('/') + 1);

    return deviceType ? `${basePath}${fileName}_${deviceType}${extension}` : src;
  }

  private addLoader(): void {
    if (!this.loaderElement) {
      this.loaderElement = this.renderer.createElement('div');
      this.renderer.setStyle(this.loaderElement, 'position', 'absolute');
      this.renderer.setStyle(this.loaderElement, 'top', '50%');
      this.renderer.setStyle(this.loaderElement, 'left', '50%');
      this.renderer.setStyle(this.loaderElement, 'transform', 'translate(-50%, -50%)');
      this.renderer.setStyle(this.loaderElement, 'z-index', '10');

      const circleLoader = this.renderer.createElement('div');
      this.renderer.addClass(circleLoader, 'circle-loader');
      this.renderer.appendChild(this.loaderElement, circleLoader);

      const parent = this.el.nativeElement.parentElement;
      if (parent) {
        this.renderer.setStyle(parent, 'position', 'relative');
        this.renderer.appendChild(parent, this.loaderElement);
      }
    }
  }

  private removeLoader(): void {
    if (this.loaderElement) {
      const parent = this.el.nativeElement.parentElement;
      if (parent) {
        this.renderer.removeChild(parent, this.loaderElement);
      }
      this.loaderElement = null;
    }
  }

  private showErrorIcon(): void {
    const errorContainer = this.renderer.createElement('div');
    this.renderer.setStyle(errorContainer, 'position', 'absolute');
    this.renderer.setStyle(errorContainer, 'top', '50%');
    this.renderer.setStyle(errorContainer, 'left', '50%');
    this.renderer.setStyle(errorContainer, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(errorContainer, 'text-align', 'center');

    const errorIcon = this.renderer.createElement('i');
    this.renderer.addClass(errorIcon, 'la');
    this.renderer.addClass(errorIcon, 'la-exclamation-circle');
    this.renderer.setStyle(errorIcon, 'font-size', '1.5em');

    const errorMessage = this.renderer.createText('Image could not be loaded');

    this.renderer.appendChild(errorContainer, errorIcon);
    this.renderer.appendChild(errorContainer, errorMessage);
    this.renderer.appendChild(this.el.nativeElement, errorContainer);
  }
}
