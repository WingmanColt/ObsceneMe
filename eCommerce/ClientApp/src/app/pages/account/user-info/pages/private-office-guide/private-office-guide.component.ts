import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-private-office-guide',
  templateUrl: './private-office-guide.component.html',
  styleUrl: './private-office-guide.component.scss'
})
export class PrivateOfficeGuideComponent implements OnInit {
  
  settings = environment.pagesSettings.AffiliateGuideSettings.AffiliateGuide;

  constructor() {
  }

  ngOnInit(): void {

  }

}
