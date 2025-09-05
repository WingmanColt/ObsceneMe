import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';

@Component({
  selector: 'app-footer-one',
  templateUrl: './footer-one.component.html',
  styleUrls: ['./footer-one.component.scss']
})
export class FooterOneComponent implements OnInit  {
  today: number = Date.now();
  env = environment;
  public isMobile: boolean;

  constructor(private deviceDetector: BreakpointDetectorService) {

  }
  ngOnInit(): void {
    this.isMobile = this.deviceDetector.isDevice("Mobile");
    }


}
