import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { provideImageKitLoader } from '@angular/common';
import { swiperTeamConfig } from 'src/app/configs/swiperConfig';
import SwiperCore from 'swiper';

SwiperCore.use(swiperTeamConfig.modules);

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  providers: [{ provide: environment.imageKitCloud ? provideImageKitLoader(environment.imageKitUrl) : undefined, useClass: AboutUsComponent }]
})
export class AboutUsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public env = environment.pagesSettings;
  public config = swiperTeamConfig;

}
