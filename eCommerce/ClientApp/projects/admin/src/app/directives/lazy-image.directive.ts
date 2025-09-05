import { Directive, ElementRef, Input, OnChanges, AfterViewInit, Renderer2, AfterViewChecked } from '@angular/core';

@Directive({
  selector: '[lazyOptimizedImage]'
})
export class LazyOptimizedImageDirective implements OnChanges, AfterViewInit, AfterViewChecked {
  @Input('lazyOptimizedImage') src: string;

  private loaderElement: HTMLElement;
  private imageElement: HTMLImageElement;
  private imageLoaded: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.imageElement = this.el.nativeElement as HTMLImageElement;
    this.applyBlur();
    this.addLoader();

      if (this.src) {
        const deviceType = this.getDeviceType();
        const size = this.getSizeForDevice(deviceType);
        const imageName = this.getImageName(this.src, size, deviceType);
        this.imageElement.src = imageName;
      }

    // Ensure loader is removed after 10 seconds
      if (!this.imageLoaded) {
        this.removeLoader();
        this.removeBlur();
      }

  }

  ngOnChanges(): void {
    if (this.src && this.imageElement) {
      // Ensure loader is added if src changes
      this.addLoader();
      const deviceType = this.getDeviceType();
      const size = this.getSizeForDevice(deviceType);
      const imageName = this.getImageName(this.src, size, deviceType);
      this.imageElement.src = imageName;
    }
  }

  ngAfterViewChecked(): void {
    // Remove blur after image is fully loaded
    if (this.imageLoaded && this.imageElement) {
      this.removeBlur();
    }
  }

  private getDeviceType(): string {
    const screenWidth = window.innerWidth;
    return screenWidth < 700 ? 'mobile' : 'desktop';
  }

  private getSizeForDevice(deviceType: string): string {
    const screenWidth = window.innerWidth;

    if (deviceType === 'mobile') {
      if (screenWidth < 540) {
        return '540x';
      } else if (screenWidth >= 540 && screenWidth < 720) {
        return '720x';
      } else if (screenWidth >= 720 && screenWidth < 1080) {
        return '1080x';
      } else if (screenWidth >= 1080 && screenWidth < 1296) {
        return '1296x';
      } else {
        return 'default';
      }
    }

    if (screenWidth < 720) {
      return '720x';
    } else if (screenWidth >= 720 && screenWidth < 1512) {
      return '1512x';
    } else if (screenWidth >= 1512 && screenWidth < 1950) {
      return '1950x';
    } else if (screenWidth >= 1950 && screenWidth < 2700) {
      return '2700x';
    } else {
      return 'default';
    }
  }

  private getImageName(src: string, size: string, deviceType?: string): string {
    const fileName = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));
    const extension = src.substring(src.lastIndexOf('.'));
    const basePath = src.substring(0, src.lastIndexOf('/') + 1);
    if (deviceType) {
      return `${basePath}${fileName}_${deviceType}_${size}${extension}`;
    } else {
      return `${basePath}${fileName}_default${extension}`;
    }
  }

  private addLoader(): void {
    if (this.imageElement && this.imageElement.parentElement) {
      this.removeLoader(); // Ensure no existing loader
      this.loaderElement = this.renderer.createElement('div');
      this.renderer.addClass(this.loaderElement, 'circle-loader');
      this.renderer.setStyle(this.loaderElement, 'position', 'absolute');
      this.renderer.setStyle(this.loaderElement, 'top', '50%');
      this.renderer.setStyle(this.loaderElement, 'left', '50%');
      this.renderer.setStyle(this.loaderElement, 'transform', 'translate(-50%, -50%)');
      this.renderer.setStyle(this.loaderElement, 'z-index', '10');
      this.renderer.setStyle(this.loaderElement, 'width', '40px');
      this.renderer.setStyle(this.loaderElement, 'height', '40px');

      const parent = this.imageElement.parentElement;
      this.renderer.setStyle(parent, 'position', 'relative');
      this.renderer.appendChild(parent, this.loaderElement);

      // Ensure the loader rotates
      this.renderer.addClass(this.loaderElement, 'circle-loader');
    }
  }

  private removeLoader(): void {
    if (this.loaderElement) {
      const parent = this.imageElement.parentElement;
      if (parent) {
        this.renderer.removeChild(parent, this.loaderElement);
      }
      this.loaderElement = null;
    }
  }

  private applyBlur(): void {
    if (this.imageElement) {
      this.imageElement.style.filter = 'blur(10px)';
    }
  }

  private removeBlur(): void {
    if (this.imageElement) {
      this.imageElement.style.filter = 'none';
    }
  }
}
