export class SlideConfig {
  title?: string;
  titlePosition?: string;

  draggable?:boolean = false;
  slides: any[] = [];
  slidesToSlide: number = 1;
  slideChangeDelay: number = 300;
  slidesPerView: number = 1;
  slideWidth?: number;
  changeToClickedSlide?:boolean;
  autoPlay: boolean = false;
  delay: number = 5000;
  loop: number = 0;
  vertical: boolean = false;

  navEnabled?: boolean;
  navPosition?: string;
  navHoverable?: boolean = false;
  paginationEnabled?: boolean;
  paginationPosition?: string;
  breakpoints?: SlideBreakpoints;

  constructor(config?: Partial<SlideConfig>) {
    Object.assign(this, config);
  }
}

export interface SlideBreakpointConfig extends Partial<SlideConfig> { } 
export interface SlideBreakpoints {
  mobile?: SlideBreakpointConfig;
  tablet?: SlideBreakpointConfig;
  desktop?: SlideBreakpointConfig;
}
