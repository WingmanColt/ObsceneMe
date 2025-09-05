import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { environment } from "environments/environment";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { SimpleSliderComponent2 } from "src/app/shared/slider/simple-slider.component";

@Component({
  selector: "app-gallery-style-thumbsmain",
  templateUrl: "./style-thumbMain.component.html",
  styleUrls: ["./style-thumbMain.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryStyleThumbsMainComponent implements OnInit, OnDestroy, AfterViewInit
{
  @Input() imageObjects: any[];
  @Input() activeIndex: number;
  @Output() closeModal = new EventEmitter<void>();

  env = environment;
  gallerySettings = environment.swiperSettings.gallerySwiperSettings;
  defaultImage: string = this.env.placeholderSrc;
  
  isMobile: boolean;
  imageLoading: number = 1;

  @ViewChild('MainSlider') MainSlider: SimpleSliderComponent2;
  sliderConfigMain: any = {
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000, 
    changeToClickedSlide: true,
    breakpoints: {
      mobile: { slideWidth: 100, slidesPerView: 1, slidesToSlide: 1 },
      tablet: { slideWidth: 100, slidesPerView: 1, slidesToSlide: 1 },
      desktop: { slideWidth: 100, slidesPerView: 1, slidesToSlide: 1 }
    }
  };

  @ViewChild('ThumbsSlider') ThumbsSlider: SimpleSliderComponent2;
  sliderConfigThumbs: any = {
    slideChangeDelay: 50,
    draggable: true,
    delay: 5000, 
    changeToClickedSlide: true,
    breakpoints: {
      mobile: { vertical:false, slideWidth: 20, slidesPerView: 5, slidesToSlide: 4 },
      tablet: { vertical:false, slideWidth: 20, slidesPerView: 4, slidesToSlide: 4 },
      desktop: { vertical:true, slideWidth: 75, slidesPerView: 5, slidesToSlide: 5 }
    }
  };

  constructor(private device: BreakpointDetectorService) {}


  ngOnInit(): void {
    this.isMobile = this.device.isDevice("Mobile");

    this.sliderConfigMain.slides = this.imageObjects;
    this.sliderConfigThumbs.slides = this.imageObjects;
  }

  ngAfterViewInit(): void {     
    if(this.MainSlider)
      this.MainSlider.handleOnSlideClick(this.activeIndex); 

    if(this.ThumbsSlider)
      this.ThumbsSlider.handleOnSlideClick(this.activeIndex);
  }

  onSlideChangeMain($event:number) {
    this.ThumbsSlider.handleOnSlideClick($event); 
  }

  onSlideChangeThumbs($event) {
    this.MainSlider.handleOnSlideClick($event); 
  }

  onImageLoad(): void {
    this.imageLoading = 0;
  }
  onImageError(): void {
    this.imageLoading = 2;
  }
  getImageSrc(imageSrc: string): string {
    return imageSrc.startsWith("http") ? imageSrc :  `assets/images/reviews/${imageSrc}`;
  }
  

  ngOnDestroy(): void {
    if(this.MainSlider)
      this.MainSlider.sliderDestroy(); 

    if(this.ThumbsSlider)
      this.ThumbsSlider.sliderDestroy();
  }

  close(): void {
    this.closeModal.emit();
  }

}


/*
let zoomedIn = false;

let initialDistance = 0;
let initialScale = 1;
let initialX = 0;
let initialY = 0;
let isPanning = false;
let isPinching = false;

const zoomScale = 1.1; // Scale factor for zooming
const zoomSpeed = 0.1; // Controls the zoom speed (higher value = faster zoom)

function handleMouseMove(event: MouseEvent, container: HTMLElement): void {
  if (!zoomedIn) return;

  const targetElement = event.target as HTMLElement;
  const img = (targetElement.tagName === 'IMG' ? targetElement : targetElement.querySelector('img')!) as HTMLImageElement;
  const containerRect = container.getBoundingClientRect();

  // Mouse position relative to the container
  const mouseX = event.pageX - containerRect.left - window.scrollX;
  const mouseY = event.pageY - containerRect.top - window.scrollY;

  // Calculate container and image dimensions
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const imgWidth = img.naturalWidth * zoomScale;
  const imgHeight = img.naturalHeight * zoomScale;

  // Calculate maximum offsets
  const maxOffsetX = Math.max(containerWidth - imgWidth, 0);
  const maxOffsetY = Math.max(imgHeight - containerHeight, 0);

  // Calculate zoom offsets with a wider range
  let offsetX = (mouseX / containerWidth) * maxOffsetX;
  let offsetY = (mouseY / containerHeight) * maxOffsetY;

  // Allow the image to move beyond the container boundaries
  const extraOffset = 1000; // Additional offset allowed beyond the container boundaries

  // Adjust offsets to allow full movement within the zoomed image
  offsetX = Math.min(Math.max(offsetX - maxOffsetX / 2, -extraOffset), maxOffsetX + extraOffset);
  offsetY = Math.min(Math.max(offsetY - maxOffsetY / 2, -extraOffset), maxOffsetY + extraOffset);


  // Apply the transform to zoom in and move the image
  img.style.setProperty('width', `${imgWidth}px`, 'important');
  img.style.setProperty('height', `${imgHeight}px`, 'important');
  img.style.setProperty('position', 'absolute', 'important');
  img.style.setProperty('transform', `translate(${offsetX}px, ${offsetY}px) scale(${zoomScale})`, 'important');
  img.style.setProperty('transformOrigin', '0 0', 'important');
}

function handleMouseOver(event: MouseEvent, container: HTMLElement): void {
  zoomedIn = true;

  const img = container.querySelector('img')!;
  img.style.transition = `transform ${zoomSpeed}s ease`; // Adjust transition speed
}


function handleMouseOut(event: MouseEvent, container: HTMLElement): void {
  zoomedIn = false;

  const img = container.querySelector('img')!;
  img.removeAttribute('style');
}
/*
function handleTouchMove(event) {
  if (!zoomedIn) return;

  const container = event.currentTarget;
  const img = container.querySelector('img');
  if (!img) return;

  if (event.touches.length === 1) {
    // Handle panning
    if (isPanning) {
      const touch = event.touches[0];
      const containerRect = container.getBoundingClientRect();
      const touchX = touch.clientX - containerRect.left;
      const touchY = touch.clientY - containerRect.top;

      const offsetX = touchX - initialX;
      const offsetY = touchY - initialY;

      img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomScale})`;
      img.style.transformOrigin = '0 0';
    }
  } else if (event.touches.length === 2) {
    // Handle pinch-to-zoom
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = Math.sqrt(
      (touch2.clientX - touch1.clientX) ** 2 +
      (touch2.clientY - touch1.clientY) ** 2
    );

    if (isPinching) {
      const scale = currentDistance / initialDistance * initialScale;
      img.style.transform = `scale(${scale})`;
      img.style.transformOrigin = '0 0';
    } else {
      initialDistance = currentDistance;
      initialScale = zoomScale;
      isPinching = true;
    }
  }
}

function handleTouchStart(event) {
  if (event.touches.length === 1) {
    // Store initial positions for panning
    const touch = event.touches[0];
    const containerRect = event.currentTarget.getBoundingClientRect();
    initialX = touch.clientX - containerRect.left;
    initialY = touch.clientY - containerRect.top;
    isPanning = true;
  } else if (event.touches.length === 2) {
    // Initialize pinch-to-zoom
    isPinching = true;
  }
}

function handleTouchEnd(event) {
  const container = event.currentTarget;
  const img = container.querySelector('img');
  if (!img) return;

  img.removeAttribute('style');

  isPanning = false;
  isPinching = false;
}

function addEventListeners(container: HTMLElement): void {
  if (container) {
  container.addEventListener('mousemove', (e) => handleMouseMove(e, container));
  container.addEventListener('mouseover', (e) => handleMouseOver(e, container));
  container.addEventListener('mouseout', (e) => handleMouseOut(e, container));

  container.addEventListener('touchmove', handleTouchMove);
  container.addEventListener('touchstart', handleTouchStart);
  container.addEventListener('touchend', handleTouchEnd);
  }
}

function removeEventListeners(container: HTMLElement): void {
  if (container) {
  container.removeEventListener('mousemove', (e) => handleMouseMove(e, container));
  container.removeEventListener('mouseover', (e) => handleMouseOver(e, container));
  container.removeEventListener('mouseout', (e) => handleMouseOut(e, container));

  container.addEventListener('touchmove', handleTouchMove);
  container.addEventListener('touchstart',  handleTouchStart);
  container.addEventListener('touchend', handleTouchEnd);
  }
}*/


/*
let zoomedIn = false;
let zoomAtPointEnabled = false;
let initialDistance: number | null = null;
let startTouches: TouchList | null = null;

let clickTimeout: number | null = null;
const doubleClickThreshold = 300; // Time in milliseconds for mouse double-click
const singleClickThreshold = 200; // Time in milliseconds for single click activation

// Handles mouse and touch events
export function handleClickOrTap(event: MouseEvent | TouchEvent, container: HTMLElement): void {
  const isTouch = 'touches' in event;

  // Check if there is an existing timeout, indicating a previous click/tap
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;

    // Double-click detected
    if (!zoomedIn && !isTouch) {
      zoomInAtPoint(event, container); // Zoom in on double-click
    } else if (zoomedIn) {
      if (zoomAtPointEnabled) {
        zoomOut(container); // Zoom out on double-click if zoomAtPointEnabled is true
      } else {
        zoomIn(event, container); // Zoom in on double-click if zoomed in but zoomAtPointEnabled is false
      }
    }
    return;
  }

  // Set timeout to determine if this click/tap is part of a double-click
  clickTimeout = window.setTimeout(() => {
    if (!zoomedIn && !isTouch) {
      activateZoom(container); // Single click to activate zoom
    }
    clickTimeout = null;
  }, isTouch ? singleClickThreshold : doubleClickThreshold);
}

function activateZoom(container: HTMLElement): void {
  // Set flag or perform any necessary actions to enable zoom functionality
  console.log('Zoom functionality activated.');
  // You might want to add some visual feedback or instructions for the user here
}

function zoomIn(event: MouseEvent | TouchEvent, container: HTMLElement): void {
  let targetElement = (event as MouseEvent).target as HTMLElement;
  if (targetElement.tagName === 'IMG') {
    targetElement = targetElement.parentElement!;
  }

  const img = targetElement.querySelector('img')!;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  img.style.width = 'auto';
  img.style.height = 'auto';
  img.style.maxWidth = `${naturalWidth}px`;
  img.style.maxHeight = `${naturalHeight}px`;
  img.style.position = 'absolute';
  img.style.transform = 'scale(1)';
  img.style.transformOrigin = 'top left';

  zoomedIn = true;
  zoomAtPointEnabled = false; // Disable zoom at point mode
}

function zoomOut(container: HTMLElement): void {
  const img = container.querySelector('img')!;
  img.removeAttribute('style');
  zoomedIn = false;
  zoomAtPointEnabled = false;
}

function zoomInAtPoint(event: MouseEvent | TouchEvent, container: HTMLElement): void {
  let targetElement = (event as MouseEvent).target as HTMLElement;
  if (targetElement.tagName === 'IMG') {
    targetElement = targetElement.parentElement!;
  }

  const img = targetElement.querySelector('img')!;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  const rect = container.getBoundingClientRect();
  const iLeft = rect.left + window.scrollX;
  const iTop = rect.top + window.scrollY;

  const x = (event instanceof MouseEvent ? event.pageX : (event as TouchEvent).touches[0].pageX) - iLeft;
  const y = (event instanceof MouseEvent ? event.pageY : (event as TouchEvent).touches[0].pageY) - iTop;

  img.style.width = 'auto';
  img.style.height = 'auto';
  img.style.maxWidth = `${naturalWidth}px`;
  img.style.maxHeight = `${naturalHeight}px`;
  img.style.position = 'absolute';
  img.style.transform = 'scale(2)';
  img.style.transformOrigin = `${x}px ${y}px`;

  zoomedIn = true;
  zoomAtPointEnabled = true; // Enable zoom-at-point mode
}

function handleTouchStart(event: TouchEvent, container: HTMLElement): void {
  if (event.touches.length === 2) {
    startTouches = event.touches;
    initialDistance = getDistance(event.touches[0], event.touches[1]);
  } else if (event.touches.length === 1 && zoomedIn && !zoomAtPointEnabled) {
    startTouches = event.touches;
  }
}

function handleTouchMove(event: TouchEvent, container: HTMLElement): void {
  if (zoomedIn) {
    if (event.touches.length === 2 && startTouches && initialDistance) {
      const currentDistance = getDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / initialDistance;
      const img = container.querySelector('img')!;
      const rect = container.getBoundingClientRect();
      const iLeft = rect.left + window.scrollX;
      const iTop = rect.top + window.scrollY;

      img.style.transform = `scale(${scale})`;

      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const x = (touch1.pageX + touch2.pageX) / 2 - iLeft;
      const y = (touch1.pageY + touch2.pageY) / 2 - iTop;
      img.style.left = `${-x * scale}px`;
      img.style.top = `${-y * scale}px`;

      initialDistance = currentDistance;
    } else if (event.touches.length === 1 && startTouches) {
      const touch = event.touches[0];
      const img = container.querySelector('img')!;
      const rect = container.getBoundingClientRect();
      const iLeft = rect.left + window.scrollX;
      const iTop = rect.top + window.scrollY;

      const x = touch.pageX - iLeft;
      const y = touch.pageY - iTop;
      img.style.left = `${-x}px`;
      img.style.top = `${-y}px`;
    }
  }
}

function getDistance(touch1: Touch, touch2: Touch): number {
  return Math.sqrt(
    Math.pow(touch2.pageX - touch1.pageX, 2) +
    Math.pow(touch2.pageY - touch1.pageY, 2)
  );
}

function resetZoom(container: HTMLElement): void {
  const img = container.querySelector('img')!;
  img.removeAttribute('style');
  zoomedIn = false;
  zoomAtPointEnabled = false;
}

// Event listeners for desktop and mobile
function addEventListeners(container: HTMLElement): void {
  //container.addEventListener('click', (e) => handleClickOrTap(e, container));
  //container.addEventListener('touchstart', (e) => handleTouchStart(e, container));
  container.addEventListener('touchmove', (e) => handleTouchMove(e, container));
  container.addEventListener('mousemove', (e) => handleMouseMove(e, container));
}

function removeEventListeners(container: HTMLElement): void {
 // container.removeEventListener('click', (e) => handleClickOrTap(e, container));
  //container.removeEventListener('touchstart', (e) => handleTouchStart(e, container));
  container.removeEventListener('touchmove', (e) => handleTouchMove(e, container));
  container.removeEventListener('mousemove', (e) => handleMouseMove(e, container));
}

function handleMouseMove(event: MouseEvent, container: HTMLElement): void {
  //if (!zoomedIn || zoomAtPointEnabled) return;

  let targetElement = event.target as HTMLElement;
  if (targetElement.tagName === 'IMG') {
    targetElement = targetElement.parentElement!;
  }

  const img = targetElement.querySelector('img')!;
  const rect = container.getBoundingClientRect();
  const iLeft = rect.left + window.scrollX;
  const iTop = rect.top + window.scrollY;

  const x = event.pageX - iLeft;
  const y = event.pageY - iTop;

  const tWidth = container.offsetWidth;
  const tHeight = container.offsetHeight;
  const scaledWidth = img.naturalWidth * 1;
  const scaledHeight = img.naturalHeight * 1;

  const maxOffsetX = scaledWidth - tWidth;
  const maxOffsetY = scaledHeight - tHeight;

  const offsetX = (x / tWidth) * maxOffsetX;
  const offsetY = (y / tHeight) * maxOffsetY;

  img.style.left = `${-offsetX}px`;
  img.style.top = `${-offsetY}px`;
}

*/


/*
let zoomedIn = false;
let zoomAtPointEnabled = false;
let clickTimeout: number | null = null;
const doubleClickThreshold = 300; // Time in milliseconds for mouse double-click
const doubleTapThreshold = 500; // Time in milliseconds for touch double-tap

// Handles mouse and touch events
export function handleClickOrTap(event: MouseEvent | TouchEvent, container: HTMLElement): void {
  const isTouch = 'touches' in event;

  // Check if there is an existing timeout, indicating a previous click/tap
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;

    // Double-click (mouse) or double-tap (touch) detected
    if (!zoomAtPointEnabled) {
      zoomInAtPoint(event, container);
    }
    return;
  }

  // Set timeout to determine if this click/tap is part of a double-click/tap
  clickTimeout = window.setTimeout(() => {
    if (zoomedIn) {
      zoomOut(container);
    } else if (!zoomAtPointEnabled) {
      zoomIn(event, container);
    }
    clickTimeout = null;
  }, isTouch ? doubleTapThreshold : doubleClickThreshold);
}

function zoomIn(event: MouseEvent | TouchEvent, container: HTMLElement): void {
  let targetElement = (event as MouseEvent).target as HTMLElement;
  if (targetElement.tagName === 'IMG') {
    targetElement = targetElement.parentElement!;
  }

  const img = targetElement.querySelector('img')!;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  img.style.width = 'auto';
  img.style.height = 'auto';
  img.style.maxWidth = `${naturalWidth}px`;
  img.style.maxHeight = `${naturalHeight}px`;
  img.style.position = 'absolute';
  img.style.transform = 'scale(1)';
  img.style.transformOrigin = 'top left';

  zoomedIn = true;
  zoomAtPointEnabled = false;
}

function zoomOut(container: HTMLElement): void {
  const img = container.querySelector('img')!;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  img.removeAttribute('style');
  img.style.maxWidth = img.dataset.w || `${naturalWidth}px`;
  img.style.maxHeight = img.dataset.h || `${naturalHeight}px`;

  zoomedIn = false;
  zoomAtPointEnabled = false; // Reset zoomAtPointEnabled when zooming out
}

function zoomInAtPoint(event: MouseEvent | TouchEvent, container: HTMLElement): void {
  let targetElement = (event as MouseEvent).target as HTMLElement;
  if (targetElement.tagName === 'IMG') {
    targetElement = targetElement.parentElement!;
  }

  const img = targetElement.querySelector('img')!;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  const rect = container.getBoundingClientRect();
  const iLeft = rect.left + window.scrollX;
  const iTop = rect.top + window.scrollY;

  const x = (event instanceof MouseEvent ? event.pageX : (event as TouchEvent).touches[0].pageX) - iLeft;
  const y = (event instanceof MouseEvent ? event.pageY : (event as TouchEvent).touches[0].pageY) - iTop;

  img.style.width = 'auto';
  img.style.height = 'auto';
  img.style.maxWidth = `${naturalWidth}px`;
  img.style.maxHeight = `${naturalHeight}px`;
  img.style.position = 'absolute';
  img.style.transform = 'scale(2)';
  img.style.transformOrigin = `${x}px ${y}px`;

  zoomedIn = true;
  zoomAtPointEnabled = true; // Enable zoom-at-point mode
}

// Event listeners for desktop and mobile
function addEventListeners(container: HTMLElement): void {
  container.addEventListener('click', (e) => handleClickOrTap(e, container));
  container.addEventListener('touchstart', (e) => handleClickOrTap(e, container));
  container.addEventListener('mousemove', (e) => handleMouseMove(e, container));
  container.addEventListener('touchmove', (e) => handleTouchMove(e, container));
}
function removeEventListeners(container: HTMLElement): void {
  container.removeEventListener('click', (e) => handleClickOrTap(e, container));
  container.removeEventListener('touchstart', (e) => handleClickOrTap(e, container));
  container.removeEventListener('mousemove', (e) => handleMouseMove(e, container));
  container.removeEventListener('touchmove', (e) => handleTouchMove(e, container));
}
function handleMouseMove(event: MouseEvent, container: HTMLElement): void {
  if (!zoomedIn || zoomAtPointEnabled) return; // Prevent movement if zoom-at-point is enabled

  let targetElement = event.target as HTMLElement;
  if (targetElement.tagName === 'IMG') {
    targetElement = targetElement.parentElement!;
  }

  const img = targetElement.querySelector('img')!;
  const rect = container.getBoundingClientRect();
  const iLeft = rect.left + window.scrollX;
  const iTop = rect.top + window.scrollY;

  const x = event.pageX - iLeft;
  const y = event.pageY - iTop;

  const tWidth = container.offsetWidth;
  const tHeight = container.offsetHeight;
  const scaledWidth = img.naturalWidth * 1; // Adjusted scale factor to match zoom level
  const scaledHeight = img.naturalHeight * 1;

  const maxOffsetX = scaledWidth - tWidth;
  const maxOffsetY = scaledHeight - tHeight;

  const offsetX = (x / tWidth) * maxOffsetX;
  const offsetY = (y / tHeight) * maxOffsetY;

  img.style.left = `${-offsetX}px`;
  img.style.top = `${-offsetY}px`;
}

function handleTouchMove(event: TouchEvent, container: HTMLElement): void {
  if (!zoomedIn || zoomAtPointEnabled) return; // Prevent movement if zoom-at-point is enabled

  const touch = event.touches[0];
  let targetElement = touch.target as HTMLElement;
  if (targetElement.tagName === 'IMG') {
    targetElement = targetElement.parentElement!;
  }

  const img = targetElement.querySelector('img')!;
  const rect = container.getBoundingClientRect();
  const iLeft = rect.left + window.scrollX;
  const iTop = rect.top + window.scrollY;

  const x = touch.pageX - iLeft;
  const y = touch.pageY - iTop;

  const tWidth = container.offsetWidth;
  const tHeight = container.offsetHeight;
  const scaledWidth = img.naturalWidth * 1; // Adjusted scale factor to match zoom level
  const scaledHeight = img.naturalHeight * 1;

  const maxOffsetX = scaledWidth - tWidth;
  const maxOffsetY = scaledHeight - tHeight;

  const offsetX = (x / tWidth) * maxOffsetX;
  const offsetY = (y / tHeight) * maxOffsetY;

  img.style.left = `${-offsetX}px`;
  img.style.top = `${-offsetY}px`;
}

function resetZoom(container: HTMLElement): void {
  const img = container.querySelector('img')!;
  img.removeAttribute('style'); // Remove all styles to reset the image
  zoomedIn = false;
  zoomAtPointEnabled = false; // Reset any zoom state
}
*/
