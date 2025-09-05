import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, EventEmitter, Output, TemplateRef } from '@angular/core';
import { SlideConfig } from './simple-slider.interface';

@Component({
  selector: 'app-simple-slider',
  templateUrl: './simple-slider.component.html',
  styleUrls: ['./simple-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleSliderComponent implements OnInit, OnDestroy {
  @Input() slideTemplate!: TemplateRef<any>;
  @Input() config: SlideConfig = {
    slides: [],
    autoPlay: false, 
    delay: 5000, 
    loop: 0, 
    vertical: false,
    navEnabled: true,
    navPosition: 'top-right', 
    paginationEnabled: true,
    paginationPosition: 'top-right', 
    previousText: '',
    nextText: '',
    slideChangeDelay: 300,
    breakpoints: {
      mobile: { slidesPerView: 1, autoPlay: false, loop: 0 },
      tablet: { slidesPerView: 1.5, autoPlay: false, loop: 1 },
      desktop: { slidesPerView: 4, autoPlay: true, loop: 2 }
    }
  };

  @Output() onSlideChange = new EventEmitter<number>();

  currentSlide = 0;
  slidesPerViewAdjusted = 1; 
  
  private autoPlayInterval: number | null = null;
  private debounceTimer: any | null = null;

  ngOnInit() {
    // If the slides array is empty or only has one or two slides, disable looping
    if (this.config.slides?.length <= 2) {
      this.config.loop = 0;
    }
  
    // Warn if no slides are provided
    if (this.config.slides && this.config.slides.length <= 0) {
      console.warn('SimpleSlider: config.slides is empty: ', this.config.slides);
      return;
    }
  
    this.config = { ...this.config }; // Copy config for local use
    this.updateConfigForBreakpoint(); // Apply initial configuration
  
    if (this.config.autoPlay) {
      this.startAutoPlay();
    }
  
    // Initialize slidesPerView based on screen size
    window.addEventListener('resize', this.updateConfigForBreakpoint.bind(this));
  }
  

  ngOnDestroy() {
    this.stopAutoPlay();
    window.removeEventListener('resize', this.updateConfigForBreakpoint.bind(this));
  }


  private updateConfigForBreakpoint(): void {
    const width = window.innerWidth;
    const { mobile, tablet, desktop } = this.config.breakpoints || {};
    
    let activeBreakpointConfig = this.config; // Default to the base config
  
    if (width < 768 && mobile) {
      activeBreakpointConfig = { ...this.config, ...mobile };
    } else if (width >= 768 && width < 1024 && tablet) {
      activeBreakpointConfig = { ...this.config, ...tablet };
    } else if (width >= 1024 && desktop) {
      activeBreakpointConfig = { ...this.config, ...desktop };
    }
  
    Object.assign(this.config, activeBreakpointConfig);
    this.slidesPerViewAdjusted = this.config.slidesPerView || 1;
  
    // Set CSS variable for slides per view
    document.documentElement.style.setProperty('--slides-per-view', this.slidesPerViewAdjusted.toString());
  }
  
  private startAutoPlay(): void {
    const play = () => {
      this.onNextClick();
      this.autoPlayInterval = requestAnimationFrame(play);
    };

    this.autoPlayInterval = requestAnimationFrame(play);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      cancelAnimationFrame(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  onPreviousClick(): void {
    if (this.config.loop === 2) {
      if (this.currentSlide === 0) {
        this.currentSlide = this.config.slides.length; // Go to the last clone
      } else {
        this.currentSlide = (this.currentSlide - 1 + this.config.slides.length + 2) % (this.config.slides.length + 2);
      }
    } else if (this.config.loop === 1) {
      this.currentSlide = this.currentSlide === 0 ? this.config.slides.length : this.currentSlide - 1;
    } else {
      if (this.currentSlide > 0) {
        this.currentSlide--;
      }
    }
    this.emitSlideChange();
  }
  
  onNextClick(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (this.config.loop === 2) {
        this.currentSlide = (this.currentSlide + 1) % (this.config.slides.length + 2);
        if (this.currentSlide === this.config.slides.length + 1) {
          this.currentSlide = 1;
        }
      } else if (this.config.loop === 1) {
        this.currentSlide = this.currentSlide === this.config.slides.length ? 0 : this.currentSlide + 1;
      } else {
        if (this.currentSlide < this.config.slides.length - 1) {
          this.currentSlide++;
        }
      }
      this.emitSlideChange();
    }, this.config.slideChangeDelay);
  }
  
  onSlideClick(index: number): void {
    this.currentSlide = index;
    this.emitSlideChange();
  }

  private emitSlideChange(): void {
    this.onSlideChange.emit(this.currentSlide);
  }

  refreshSlides(newSlides: []): void {
    this.config.slides = [...newSlides];
    this.currentSlide = 0;
    this.emitSlideChange();
  }

  isCurrentSlide(index: number): boolean {
    return index === this.currentSlide || (index === 0 && this.currentSlide === this.config.slides?.length) ||
           (index === this.config.slides?.length - 1 && this.currentSlide === 0);
  }
  
  isNextSlide(index: number): boolean {
    return index === (this.currentSlide + 1) % (this.config.slides?.length + 2);
  }
  
  isPreviousSlide(index: number): boolean {
    return index === (this.currentSlide - 1 + (this.config.slides?.length + 2)) % (this.config.slides?.length + 2);
  }
  
  get isPreviousDisabled(): boolean {
    return this.config.loop === 0 && this.currentSlide === 0;
  }

  get isNextDisabled(): boolean {
    return this.config.loop === 0 && this.currentSlide === this.config.slides?.length - 1;
  }
  get navClass(): string {
    return `slider__controls ${this.config.navPosition}`;
  }

  get paginationClass(): string {
    return `thumbs ${this.config.paginationPosition}`;
  }
  getSliderWidth(): string {
    return `repeat(${this.slidesPerViewAdjusted}, 1fr)`;
  }

  get slideWidth(): string {
    return `calc(100% / ${this.slidesPerViewAdjusted})`;
  }

  // TrackBy function for *ngFor
  trackBySlideId(index: number, slide: any): number {
    return slide.id; // Adjust as per your slide data structure
  }
}
