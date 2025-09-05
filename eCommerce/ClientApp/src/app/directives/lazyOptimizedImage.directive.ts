import { Directive, ElementRef, Input, OnChanges, AfterViewInit, Renderer2, AfterViewChecked } from '@angular/core';

@Directive({
  selector: '[lazyOptimizedImage]'
})
export class LazyOptimizedImageDirective implements OnChanges, AfterViewInit, AfterViewChecked {
  @Input('lazyOptimizedImage') src: string;

  private loaderElement: HTMLElement;
  private imageElement: HTMLImageElement;
  private imageLoaded: boolean = false;
  private isImageTag: boolean = false;
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const nativeElement = this.el.nativeElement;

    this.isImageTag = nativeElement.tagName === 'IMG';

    this.applyBlur();
    this.addLoader();

    if (this.src) {
      this.loadImage();
    }

    // Fallback to remove loader and blur after 10 seconds
    setTimeout(() => {
      if (!this.imageLoaded) {
        this.removeLoader();
        this.removeBlur();
      }
    }, 10000); 
  }

  ngOnChanges(): void {
    if (this.src) {
      this.addLoader();
      this.loadImage();
    }
  }

  ngAfterViewChecked(): void {
    // Remove blur after the image is fully loaded
    if (this.imageLoaded && this.imageElement) {
      this.removeBlur();
    }
  }

  private loadImage(): void {
    const deviceType = this.getDeviceType();
    const size = this.getSizeForDevice(deviceType);
    const imageName = this.getImageName(this.src, size, deviceType);
  
    if (this.isImageTag) {
      this.imageElement = this.el.nativeElement as HTMLImageElement;
  
      // Apply blur and add loader before the image starts loading
      this.applyBlur();
      this.addLoader();
  
      // Set the image src
      this.imageElement.src = imageName;
  
      // Set up event listener for successful load
      this.imageElement.onload = () => {
        this.imageLoaded = true;
        this.removeLoader();
        this.removeBlur();
      };
  
      // Set up event listener for load error
      this.imageElement.onerror = () => {
        console.error(`Image could not be loaded: ${imageName}`);
        this.removeLoader();
        this.removeBlur(); // Ensure blur is removed even if the image fails
      };
    } else {
      // For background-image (non-<img> elements)
      this.applyBlur();
      this.addLoader();
      this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${imageName})`);
      this.renderer.setStyle(this.el.nativeElement, 'background-size', 'cover');
      this.renderer.setStyle(this.el.nativeElement, 'background-position', 'center');
  
      // Simulate background image loading (no native onload for background images)
      setTimeout(() => {
        this.imageLoaded = true;
        this.removeLoader();
        this.removeBlur();
      }, 500); // Timeout duration can be adjusted as needed
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
