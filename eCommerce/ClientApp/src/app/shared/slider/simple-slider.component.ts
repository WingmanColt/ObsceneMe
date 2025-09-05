import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, EventEmitter, Output, TemplateRef, HostListener, ViewEncapsulation } from '@angular/core';
import { SlideBreakpointConfig, SlideConfig } from './simple-slider.interface';
import { throttle } from 'lodash'; 

@Component({
  selector: 'app-simple-slider2',
  templateUrl: './simple-slider.component.html',
  styleUrls: ['./simple-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,  // Disable view encapsulation
})
export class SimpleSliderComponent2 implements OnInit, OnDestroy {
  @Input() slideTemplate!: TemplateRef<any>;
  @Input() config: Partial<SlideConfig> = {};

  @Output() onSlideChange = new EventEmitter<number>();
  @Output() onSlideClick = new EventEmitter<number>();

  currentSlide: number = 0;
  selectedSlide: number = -1;
  slideChanging: boolean = false;

  slidesPerViewAdjusted = 1; 
  visibleSlides: any[] = [];

  currentPage: number = 1;   // Starting page
  visibleDots: number[] = []; // Array holding visible dots (page numbers)
  pager: any;

  translateStyle = 'translateX(0)'; // CSS transform for translation
  shouldTranslate = false; // Flag to control translation
  isMobile: boolean = false;

  private isForwardNavigation = true;
  private autoPlayInterval: number | null = null;
  private debounceTimer: any | null = null;
  private clickBlocked = false;
  
  // Declare the clicked anchor element and whether dragging is in progress
  private isDragStarted = false;
  private isDragging = false; // Flag to track dragging state
  private startX: number = 0;
  private startY: number = 0;

  private isVerticalScrolling = false; // Flag to track vertical scrolling
  private maxVerticalDeviation = 20;
  private minSwipeDistance = 10;
  private largeSwipeThreshold: number = 50; //  This sets the minimum distance (in pixels) for a swipe to be considered "large." If the swipe distance (deltaX) is greater than this threshold, the default slide step (e.g., slidesToSlide or slidesPerViewAdjusted) will be used. If it's less, only one slide is moved.

  private onMoveThrottled: any;
  private handleResize = throttle(() => {
    this.updateSlider();
}, 100);

  ngOnInit() {
    this.sliderInit();
  }
  
  ngOnDestroy() {
    this.sliderDestroy();
  }

   sliderInit() {
    // Check if slides are provided; if not, exit early
    if (!this.config.slides || this.config.slides.length <= 0) {
      console.warn('SimpleSlider: No slides provided. Initialization aborted.');
      return;
    }

    this.onMoveThrottled = throttle(this.onMove.bind(this), 20);
    this.config.slidesToSlide = this.config.slidesToSlide ?? this.slidesPerViewAdjusted;

    // If the slides array is empty or only has one or two slides, disable looping
    if (this.config.slides?.length <= 2) {
      this.config.loop = 0;
    }
  
    this.config = { ...this.config }; // Copy config for local use
    this.updateSlider();

    if (this.config.autoPlay) {
      this.startAutoPlay();
    }
  
    // Initialize slidesPerView based on screen size
    window.addEventListener('resize', this.handleResize);
  }
  private calculateSlidesPerView(): void {
    this.shouldTranslate = this.config.slides.length > this.slidesPerViewAdjusted;
  }

  updateTranslateStyle() {
 //   if(this.currentSlide >= (this.config.slides.length - 3))
    //  return this.translateStyle = 'none';
 //else {
      return this.translateStyle = this.shouldTranslate
      ? `translate${this.config.vertical ? 'Y' : 'X'}(-${(this.currentSlide * 100) / this.slidesPerViewAdjusted}%)`
      : 'none'; 
 //}
  }

  private updateConfigForBreakpoint(): void {
    const width = window.innerWidth;
    const breakpoints = this.config.breakpoints;

    // Determine which breakpoint to apply based on width
    let breakpointConfig: SlideBreakpointConfig | undefined;
    if (width < 768) {
        breakpointConfig = breakpoints?.mobile;
        this.isMobile = true;
    } else if (width >= 768 && width < 1024) {
        breakpointConfig = breakpoints?.tablet;
        this.isMobile = false;
    } else if (width >= 1024) {
        breakpointConfig = breakpoints?.desktop;
        this.isMobile = false;
    }

    // Merge the selected breakpoint configuration into `this.config`
    // Use spread syntax to create a new configuration while keeping defaults
    this.config = new SlideConfig({
        ...this.config,   // Base config
        ...breakpointConfig // Override with breakpoint-specific settings if any
    });

    // Adjust slidesPerView and any other property for internal use
    this.slidesPerViewAdjusted = this.config.slidesPerView ?? 1;
    //this.updateVisibleSlides();
}


private updateSlider(): void {
  if (!this.config.slides || this.config.slides.length <= 0) {
    console.warn('SimpleSlider: No slides provided. Initialization aborted.');
    return;
  }

    this.updateConfigForBreakpoint(); // Apply initial configuration
    this.updateVisibleSlides();
    this.calculateSlidesPerView();
    this.pager = this.getPaginationPager(this.config.slides.length, this.currentPage, this.slidesPerViewAdjusted);
}

  private startAutoPlay(): void {
    if (!this.config.slides || this.config.slides.length <= 1) 
      return;

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
  private calculateSlideStep(currentIndex: number, isSwipe: boolean, deltaX?: number): number {
    const slidesToSlide = this.config.slidesToSlide || 0;
    const totalSlides = this.config.slides.length;
    // Use a default slide step for button clicks or large swipes
    if (!isSwipe || Math.abs(deltaX) > this.largeSwipeThreshold) {
      if (slidesToSlide === 0 || slidesToSlide >= this.slidesPerViewAdjusted) {
        return this.slidesPerViewAdjusted;
      }
  
      const slidesLeft = totalSlides - currentIndex - this.slidesPerViewAdjusted;
      return slidesLeft < slidesToSlide ? slidesLeft : slidesToSlide;
    }
  
    // For small swipes, only move by 1 slide
    return totalSlides > 1 ? this.config.slidesToSlide : 1;
  }
  
  onNextClick(slideStep?: number, targetIndex?: number): void {
    if (!this.config.slides || this.config.slides.length <= 1 || this.clickBlocked) 
      return;
  
    this.isForwardNavigation = true;
    this.slideChanging = true;
    
    // If a targetIndex is provided, navigate directly to that index.
    if (targetIndex !== undefined) {
      this.currentSlide = targetIndex;
    } else {
      slideStep = slideStep ?? this.calculateSlideStep(this.currentSlide, false);
  
      if (this.config.loop === 2) {  // Infinite loop
        this.currentSlide = (this.currentSlide + slideStep) % this.config.slides.length;
      } else if (this.config.loop === 1) {  // Loop back to start
        const remainingSlides = this.config.slides.length - this.slidesPerViewAdjusted;
        this.currentSlide = (this.currentSlide + slideStep) > remainingSlides ? 0 : this.currentSlide + slideStep;
      } else {  // No loop
        const remainingSlides = this.config.slides.length - this.slidesPerViewAdjusted;
        this.currentSlide = Math.min(remainingSlides, this.currentSlide + slideStep);
      }
    }
  
    this.emitSlideChange();
  }
  
  onPreviousClick(slideStep?: number, targetIndex?: number): void {
    if (!this.config.slides || this.config.slides.length <= 1 || this.clickBlocked) 
      return;

    this.isForwardNavigation = false;
    this.slideChanging = true;
  
    // If a targetIndex is provided, navigate directly to that index.
      if (targetIndex !== undefined) {
        this.currentSlide = targetIndex;
      } else {
        slideStep = slideStep ?? this.calculateSlideStep(this.currentSlide, false);
      if (this.config.loop === 2) {  // Infinite loop
        this.currentSlide = (this.currentSlide - slideStep + this.config.slides.length) % this.config.slides.length;
      } else if (this.config.loop === 1) {  // Loop back to end
        this.currentSlide = (this.currentSlide - slideStep) < 0 ? this.config.slides.length - this.slidesPerViewAdjusted : this.currentSlide - slideStep;
      } else {  // No loop
        this.currentSlide = slideStep > 0 ? Math.max(0, this.currentSlide - slideStep) : 0;
      }
    }

    this.emitSlideChange();
  }
  
  private blockClicks(): void {
    this.clickBlocked = true;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.clickBlocked = false;
    }, this.config.slideChangeDelay || 500); // Adjust delay as needed
  }

  private updateVisibleSlides(): void {
    if (!this.isForwardNavigation) return; // Only update if navigating forward

    const startIndex = this.currentSlide;
    const endIndex = Math.min(this.config.slides.length, startIndex + this.slidesPerViewAdjusted);

    // Slice the range of slides for this "page"
    this.visibleSlides = this.config.slides.slice(startIndex, endIndex);

    if (this.config.loop > 0 && endIndex - startIndex < this.slidesPerViewAdjusted) {
      const remainingSlides = this.slidesPerViewAdjusted - (endIndex - startIndex);
      this.visibleSlides = this.visibleSlides.concat(this.config.slides.slice(0, remainingSlides));
    }
 
  }

  handleOnSlideClick(index: number): void {
    if(!this.config.changeToClickedSlide)
      return;

    if (index < 0 || index >= this.config.slides.length) {
      console.warn(`Invalid index ${index}. It should be between 0 and ${this.config.slides.length - 1}.`);
      return;
    }

    if(index > -1 && index == this.selectedSlide) {
      this.selectedSlide = -1;
      return 
    }

    // Check if the clicked index is forward or backward compared to the current slide.
    if (index > this.selectedSlide) {
      // Clicked on a later slide (move forward)
      this.onNextClick(undefined, index);
      this.selectedSlide = index;
    } else if (index < this.selectedSlide) {
      // Clicked on an earlier slide (move backward)
      this.onPreviousClick(undefined, index);
      this.selectedSlide = index;
    }

   this.onSlideClick.emit(index);
  }
  

  private emitSlideChange(): void {
    if(this.isForwardNavigation)
      this.paginationNextPage();
    else 
      this.paginationPreviousPage();
  
    this.updateVisibleSlides();
    this.blockClicks();
    this.updateTranslateStyle();

    //setTimeout(()=> { this.slideChanging = false; }, 1000); // anim duration time
    this.slideChanging = false;
    this.onSlideChange.emit(this.currentSlide);
  }

  private getPaginationPager(totalSlides: number, currentPage: number = 1, slidesPerPage: number = 5) {
    // Calculate total pages based on totalSlides and slidesPerPage
    let totalPages = Math.ceil(totalSlides / slidesPerPage);
  
    // Paginate Range: Show at most 4 dots at a time
    let paginateRange = 4;
  
    // Ensure currentPage isn't out of range
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }
  
    let startDot: number, endDot: number;
  
    // When there are fewer than 4 pages, show all dots
    if (totalPages <= paginateRange) {
      startDot = 1;
      endDot = totalPages;
    } else if (currentPage <= paginateRange - 2) {
      // First page group (showing the first 4 dots)
      startDot = 1;
      endDot = paginateRange;
    } else if (currentPage >= totalPages - 1) {
      // Last page group (show the last 4 dots)
      startDot = totalPages - paginateRange + 1;
      endDot = totalPages;
    } else {
      // Middle pages, showing 4 dots around the currentPage
      startDot = currentPage - 1;
      endDot = currentPage + 2;
    }
  
    // Ensure the dots stay within bounds
    startDot = Math.max(startDot, 1);  // Ensure the start dot doesn't go below 1
    endDot = Math.min(endDot, totalPages);  // Ensure the end dot doesn't go beyond total pages
  
    // Create an array of visible dots (pages to show in the pager)
    let visibleDots = Array.from({ length: endDot - startDot + 1 }, (_, i) => startDot + i);
  
    // Return pager object with properties for pagination
    return {
      totalSlides: totalSlides,
      currentPage: currentPage,
      slidesPerPage: slidesPerPage,
      totalPages: totalPages,
      startDot: startDot,
      endDot: endDot,
      visibleDots: visibleDots,
    };
  }

  paginationNextPage() {
    if (this.pager.currentPage < this.pager.totalPages) {
      // Move to the next page
      this.pager.currentPage++;
      
      // Update pager with new dot range
      this.pager = this.getPaginationPager(this.config.slides.length, this.pager.currentPage, this.slidesPerViewAdjusted);
    }
  }
  
  paginationPreviousPage() {
    if (this.pager.currentPage > 1) {
      // Move to the previous page
      this.pager.currentPage--;
      
      // Update pager with new dot range
      this.pager = this.getPaginationPager(this.config.slides.length, this.pager.currentPage, this.slidesPerViewAdjusted);
    }
  }
  
  isSlideActive(index: number): boolean {
    // Check if the currentSlide index matches the given index
    return this.currentSlide === index ||
           (index === 0 && this.currentSlide === this.config.slides?.length) ||  // Wrap-around for the last slide to the first
           (index === this.config.slides?.length - 1 && this.currentSlide === -1); // Wrap-around for the first slide to the last
  }

  isCurrentSlide(index: number): boolean {
    return index === this.currentSlide;
  }

  get activeSlideIndex(): number {
    return this.currentSlide;
  }

  get isPreviousDisabled(): boolean {
    return this.config.loop === 0 && this.currentSlide === 0;
  }

  get isNextDisabled(): boolean {
    const totalSlides = this.config.slides?.length || 0;
    // Check if looping is disabled, and if the currentSlide is the last visible slide
    return this.config.loop === 0 && (this.currentSlide >= totalSlides - this.slidesPerViewAdjusted);
  }

  get slideWidth(): string {
    return `calc(100% / ${this.slidesPerViewAdjusted})`;
  }

  get canClickPrevious(): boolean {
    // Check if clicking the previous button is allowed
    if (this.config.loop === 2) {
      // Infinite loop, always allow
      return true;
    }
    
    if (this.config.loop === 1) {
      // Loop back to the end if at the start
      return true;
    }
  
    // Non-looping, disable if at the first slide
    return this.currentSlide > 0;
  }
  
  get canClickNext(): boolean {
    // Check if clicking the next button is allowed
    if (this.config.loop === 2) {
      // Infinite loop, always allow
      return true;
    }
  
    if (this.config.loop === 1) {
      // Loop back to the start if at the end
      return true;
    }
  
    // Non-looping, disable if at the last visible slide
    const totalSlides = this.config.slides?.length || 0;
    return this.currentSlide < totalSlides - this.slidesPerViewAdjusted;
  }
 
  trackBySlideId(index: number, slide: any): number {
      return slide.id; 
  }

  sliderDestroy(): void {
  if (this.onMoveThrottled) {
    this.onMoveThrottled.cancel(); // Cancel any pending throttled actions
  }

  this.stopAutoPlay();

  this.config = undefined;
  this.slideTemplate = undefined;

  // Manually reset any other properties
  this.isDragStarted = undefined;
  this.isDragging = undefined;
  
  this.startX = undefined;
  this.startY = undefined;

  this.currentSlide = undefined;
  this.selectedSlide = undefined;
  this.slideChanging = undefined;

  this.slidesPerViewAdjusted = undefined; 
  this.visibleSlides = undefined;

  this.translateStyle = undefined; // CSS transform for translation
  this.shouldTranslate = undefined; // Flag to control translation

  this.isForwardNavigation = undefined;
  this.autoPlayInterval = undefined;
  this.debounceTimer = undefined;
  this.clickBlocked = undefined;
  
  this.minSwipeDistance = undefined;
  this.maxVerticalDeviation = undefined;
  this.largeSwipeThreshold = undefined; 

  window.removeEventListener('resize', this.handleResize);
}


onStart(event: MouseEvent | TouchEvent): void {
  const e = event instanceof MouseEvent ? event : event.touches[0];
  if (this.config.draggable) {
    const target = e.target as HTMLElement;

    // Check if the element or any of its ancestors has the 'drag-handle' class
    if (target.closest('.drag-handle')) {
      this.isDragStarted = true;
      this.isDragging = false; // Reset dragging state
      this.isVerticalScrolling = false; // Reset vertical scrolling state

        this.startX = e.clientX || e.pageX;
        this.startY = e.clientY || e.pageY;
  
        // Activate the drag handle
        const dragHandle = document.querySelector('.drag-handle');
        if (dragHandle) {
          dragHandle.classList.add('active');
        }
      }
      
  /*  if (['IMG', 'A', 'P', 'BUTTON', 'DIV', 'SPAN'].includes(target.tagName)) {
      this.isDragStarted = true;
      this.isDragging = true; // Start dragging
      this.startX = e.clientX || e.pageX;
      this.startY = e.clientY || e.pageY; // Track initial Y for scroll detection

      if (target.tagName === 'A') {
        this.anchorClicked = target as HTMLAnchorElement;
      }
    // Add dragging class to disable pointer events for other content
    document.querySelector('.slide-content')?.classList.add('dragging');

    // Activate the drag handle
    const dragHandle = document.querySelector('.drag-handle');
    if (dragHandle) {
      dragHandle.classList.add('active');
    }
    }
*/
  }
}



onMove(event: MouseEvent | TouchEvent): void {
  if (!this.isDragStarted) return;

  const e = event instanceof MouseEvent ? event : event.touches[0];
  const deltaX = (e.clientX || e.pageX) - this.startX;
  const deltaY = (e.clientY || e.pageY) - this.startY;

  // Detect vertical scrolling
  if (!this.isDragging && Math.abs(deltaY) > this.maxVerticalDeviation && Math.abs(deltaY) > Math.abs(deltaX)) {
    this.isVerticalScrolling = true; // Allow scrolling
    this.isDragStarted = false; // Stop dragging logic
    return;
  }


  if (Math.abs(deltaX) > this.minSwipeDistance && Math.abs(deltaY) < this.maxVerticalDeviation) {
    event.preventDefault();
    this.isDragging = true;

    const isSwipeRight = deltaX > 0;
    const slideStep = this.calculateSlideStep(this.currentSlide, true, deltaX);

    if (isSwipeRight) {
      this.onPreviousClick(slideStep);
    } else {
      this.onNextClick(slideStep);
    }

    // Reset dragging state after navigation
    this.isDragStarted = false;
   }

}

// Use throttle to improve performance
onThrottledMove(event: MouseEvent | TouchEvent): void {
  // Block if dragging is in progress
  if (this.isDragging) {
    event.preventDefault();
    return;
  }

  this.onMoveThrottled(event);
}


onEnd(event: MouseEvent | TouchEvent): void {
  if (!this.isDragStarted) return;

  const e = event instanceof MouseEvent ? event : event.changedTouches[0];
  const deltaX = (e.clientX || e.pageX) - this.startX;

 // Detect and navigate based on swipe distance
 if (!this.isVerticalScrolling && Math.abs(deltaX) > this.minSwipeDistance) {
  const isSwipeRight = deltaX > 0;
  const slideStep = this.calculateSlideStep(this.currentSlide, true, deltaX);

  if (isSwipeRight) {
    this.onPreviousClick(slideStep);
  } else {
    this.onNextClick(slideStep);
  }
}

  const dragHandle = document.querySelector('.drag-handle');
  if (dragHandle) {
    dragHandle.classList.remove('active');
  }

  // Reset dragging state
  this.isDragStarted = false;
  this.isDragging = false;
  this.isVerticalScrolling = false;
}


onLeave(): void {
  this.isDragStarted = false;
  this.isDragging = false; // End dragging
  this.isVerticalScrolling = false; // Reset vertical scrolling flag

  const dragHandle = document.querySelector('.drag-handle');
  if (dragHandle) {
    dragHandle.classList.remove('active');
  }

 }

/*@HostListener('mousedown', ['$event'])
@HostListener('touchstart', ['$event'])
onStart(event: MouseEvent | TouchEvent): void {
  const e = event instanceof MouseEvent ? event : event.touches[0];
  if (this.config.draggable) {
    const target = e.target as HTMLElement;
    if (['IMG', 'A', 'P', 'BUTTON', 'DIV', 'SPAN'].includes(target.tagName)) {
      this.isDragStarted = true;
      this.isDragging = true; // Start dragging
      this.startX = e.clientX || e.pageX;
      this.startY = e.clientY || e.pageY; // Track initial Y for scroll detection

      if (target.tagName === 'A') {
        this.anchorClicked = target as HTMLAnchorElement;
      }
    }
  }
}

@HostListener('mousemove', ['$event'])
@HostListener('touchmove', ['$event'])
onMove(event: MouseEvent | TouchEvent): void {
  if (this.isDragging) {  // Block if dragging is in progress
    event.preventDefault();
    return;
  }

  if (!this.isDragStarted) return;

  const e = event instanceof MouseEvent ? event : event.touches[0];
  const deltaX = (e.clientX || e.pageX) - this.startX;
  const deltaY = (e.clientY || e.pageY) - this.startY;

  if (Math.abs(deltaX) > this.minSwipeDistance && Math.abs(deltaY) < this.maxVerticalDeviation) {
    event.preventDefault();

    const isSwipeRight = deltaX > 0;
    const slideStep = this.calculateSlideStep(this.currentSlide, true, deltaX);

    if (isSwipeRight) {
      this.onPreviousClick(slideStep);
    } else {
      this.onNextClick(slideStep);
    }

    // Reset dragging state after navigation
    this.isDragStarted = false;
  }
}

// Use throttle to improve performance
@HostListener('mousemove', ['$event'])
@HostListener('touchmove', ['$event'])
onThrottledMove(event: MouseEvent | TouchEvent): void {
  // Block if dragging is in progress
  if (this.isDragging) {
    event.preventDefault();
    return;
  }

  this.onMoveThrottled(event);
}

@HostListener('mouseup', ['$event'])
@HostListener('touchend', ['$event'])
onEnd(event: MouseEvent | TouchEvent): void {
  if (!this.isDragStarted) return;

  const e = event instanceof MouseEvent ? event : event.changedTouches[0];
  const deltaX = (e.clientX || e.pageX) - this.startX;

  // Detect and navigate based on swipe distance
  if (Math.abs(deltaX) > this.minSwipeDistance) {
    const isSwipeRight = deltaX > 0;
    const slideStep = this.calculateSlideStep(this.currentSlide, true, deltaX);

    if (isSwipeRight) {
      this.onPreviousClick(slideStep);
    } else {
      this.onNextClick(slideStep);
    }
  }

  // Reset dragging state
  this.isDragStarted = false;
  this.anchorClicked = null;
  this.isDragging = false; // End dragging
}

@HostListener('mouseleave', ['$event'])
@HostListener('touchcancel', ['$event'])
onLeave(): void {
  this.isDragStarted = false;
  if (this.anchorClicked) {
    this.anchorClicked = null;
  }
  this.isDragging = false; // End dragging
 } */

}
