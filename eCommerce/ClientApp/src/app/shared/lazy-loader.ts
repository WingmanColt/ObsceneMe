import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  Output,
  EventEmitter,
  ComponentRef,
  OnDestroy
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lazy-loader',
  template: `
    <div #lazyLoadContainer [class.ajax-loadable-slider]="isLoading" 
    [ngClass]="{ 'loading': (isLoading && visibleLoader), 'loaded': componentVisible }">
    </div>
  `
})
export class LazyLoaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lazyLoadContainer', { read: ViewContainerRef, static: false }) lazyLoadContainer!: ViewContainerRef;
  @Input() lazyComponentType!: any;
  @Input() visibleLoader: boolean = true;
  @Input() loadOnClick: boolean = false; // New input for click event
  @Output() lazyComponentVisible: EventEmitter<boolean> = new EventEmitter<boolean>();

  isLoading: boolean = false;
  componentVisible: boolean = false;
  private componentRef!: ComponentRef<any>;
  private intersectionObserver!: IntersectionObserver;

  constructor(private translateService: TranslateService) {}

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.isLoading = false;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  ngOnInit(): void {
    // Moved click handler setup to ngAfterViewInit
  }

  ngAfterViewInit(): void {
    if (this.loadOnClick) {
      this.setupClickHandler();
    } else {
      this.setupScrollObserver();
    }
  }

  private setupScrollObserver(): void {
    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.componentVisible) {
          this.showLoader();
                
        setTimeout(() => {
          if (!this.componentVisible) { // Prevent creating multiple instances
            this.loadLazyComponent();
            this.intersectionObserver.unobserve(entry.target);
          }
        }, 100); // 1-second delay

        }
      });
    });

    if (this.lazyLoadContainer?.element?.nativeElement) {
      this.intersectionObserver.observe(this.lazyLoadContainer.element.nativeElement);
    }
  }

  private setupClickHandler(): void {
    if (this.lazyLoadContainer && this.lazyLoadContainer.element.nativeElement) {

      this.lazyLoadContainer.element.nativeElement.addEventListener('click', () => {
        if (!this.componentVisible) {
          this.loadLazyComponent();
        }
      });
    } else {
      console.error('LazyLoadContainer is not yet initialized.');
    }
  }

  showLoader(): void {
    this.isLoading = true;
  }

  hideLoader(): void {
    this.isLoading = false;
  }

  loadLazyComponent() {
    if (this.lazyComponentType) {
      // Destroy previous component if it exists
      if (this.componentRef) {
        this.componentRef.destroy();
      }

      // Create the component directly using the class
      this.componentRef = this.lazyLoadContainer.createComponent(this.lazyComponentType);
      this.componentVisible = true;
      this.lazyComponentVisible.emit(true);

      // Translate content if necessary
      this.translateContent(this.componentRef.location.nativeElement);

      // Hide loader after component is loaded
      this.hideLoader();
    } else {
      console.error('Lazy component type not provided.');
    }
  }

  translateContent(element: HTMLElement) {
    const childNodes = element.childNodes;

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
        const translationKey = node.nodeValue.trim();
        const translatedText = this.translateService.instant(translationKey);
        node.nodeValue = translatedText;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        this.translateContent(node as HTMLElement); // Recursively translate child elements
      }
    });
  }
}
