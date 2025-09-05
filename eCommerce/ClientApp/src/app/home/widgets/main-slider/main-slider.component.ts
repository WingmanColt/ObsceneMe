import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { SliderStateService } from 'src/app/Services/SimpleSlider/simpleSlider.service';

@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrl: './main-slider.component.scss'
})
export class MainSliderComponent implements OnInit, AfterViewInit {
  slides: any[] = [];
  sliderConfig: any = {};

  isAnimating = false;
  isMobile: boolean;
  pageLoaded = false; // ✅ track page load

  @ViewChildren('bgVideo') videos!: QueryList<ElementRef<HTMLVideoElement>>;
  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer, 
    private simpleSliderService: SliderStateService,
    deviceService: BreakpointDetectorService) {
      
    this.sliderConfig.slides = this.simpleSliderService.slides;
    this.sliderConfig = this.simpleSliderService.config;
    this.isMobile = !deviceService.isDevice('Desktop');
  }

  ngOnInit(): void {
    this.sliderConfig.slides = this.simpleSliderService.slides;
    this.sliderConfig = this.simpleSliderService.config;

    this.slides = this.simpleSliderService.slides.map(slide => ({
      ...slide,
      isActive: false,
      isLoading: true, 
      muted: true,      
      videoSrc: slide.videoSrc,
      videoWebmSrc: slide.videoWebmSrc
    }));
  }

  ngAfterViewInit(): void {
    window.addEventListener('load', () => {
      if (!this.slides.length) return;

      this.slides.forEach((slide, index) => {
        slide.isActive = index === 0;
        slide.muted = true; // ensure initial muted state

        const video = this.videos.toArray()[index].nativeElement;
        video.muted = slide.muted;  // sync DOM with slide state
      });

      this.cdr.detectChanges();

      setTimeout(() => this.playActiveVideo(), 1000);
    });
  }
  playActiveVideo() {
    this.videos.forEach((videoRef, index) => {
      const slide = this.slides[index];
      const video: HTMLVideoElement = videoRef.nativeElement;

      video.muted = slide.muted;

      if (slide.isActive) {
        video.play().catch((err) => {
          // Autoplay failed → show poster instead
          console.warn('Autoplay blocked:', err);
          slide.isLoading = false;
        });
      } else {
        video.pause();
      }
    });
  }

  toggleMute(slide: any, video: HTMLVideoElement) {
    slide.muted = !slide.muted;
    video.muted = slide.muted;   // sync immediately

    if (!slide.muted) {
      video.play().catch(() => {}); // play sound if unmuted
    }
  }

  onVideoLoadStart(slide: any) {
    slide.isLoading = true; 
    slide._loadStartTime = Date.now(); // track start time
  }

  onVideoLoaded(slide: any) {
    const elapsed = Date.now() - (slide._loadStartTime || 0);
    const minTime = 1500; // 1.5 seconds

    if (elapsed < minTime) {
      // Wait the remaining time before hiding loader
      setTimeout(() => slide.isLoading = false, minTime - elapsed);
    } else {
      // Already loaded longer than 1.5s → hide immediately
      slide.isLoading = false;
    }
  }

  onVideoError(slide: any) {
    slide.isLoading = false;
  }

  onSlideChange(event: any) {
    const currentIndex = event.currentSlide;

    this.slides.forEach((slide, i) => slide.isActive = i === currentIndex);

    this.cdr.detectChanges(); // ensure [muted] updated

    setTimeout(() => this.playActiveVideo(), 50);
  }

  // Centralize style application
  applyStyles(align: string, color: string, animationTime: number) {
    return {
      'text-align': align,
      'color': color,
      'animation': this.isAnimating ? 'unset !important' : `createBox ${animationTime}s`,
    };
  }

  // Centralize button logic
  getButtons(slide: any) {
    return [
      {
        link: slide.btnLink,
        target: slide.btnLinkNewBlank ? '_blank' : '_self',
        color: slide.btnColor,
        textColor: slide.btnTextColor,
        text: slide.btnText,
      },
      {
        link: slide.btn2Link,
        target: slide.btn2LinkNewBlank ? '_blank' : '_self',
        color: slide.btn2Color,
        textColor: slide.btn2TextColor,
        text: slide.btn2Text,
      }
    ].filter(btn => btn.link); // Filter out buttons with no link
  }

  isVideoSlide(slide: any): boolean {
    return slide.videoUrl && slide.videoUrl.includes('youtube.com');
  }

  sanitize(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
