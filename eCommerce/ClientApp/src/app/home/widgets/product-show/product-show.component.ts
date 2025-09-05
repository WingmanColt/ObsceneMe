import { Component } from '@angular/core';
import { environment } from 'environments/environment';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';

@Component({
  selector: 'app-product-show',
  templateUrl: './product-show.component.html',
  styleUrl: './product-show.component.scss'
})
export class ProductShowComponent {
  env = environment;
  isMobile: boolean;

  constructor(public deviceDetector: BreakpointDetectorService) {
  this.isMobile = this.deviceDetector.isDevice("Mobile");
  }
  
}
