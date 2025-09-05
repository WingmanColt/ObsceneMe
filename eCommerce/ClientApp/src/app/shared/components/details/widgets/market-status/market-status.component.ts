import { Component, Input } from '@angular/core';
import { MarketStatus } from 'src/app/shared/classes/product';

@Component({
  selector: 'app-market-status',
  templateUrl: './market-status.component.html',
  styleUrl: './market-status.component.scss'
})
export class MarketStatusComponent {

  @Input() MarketStatus: MarketStatus;
  MarketStatusEnum = MarketStatus; 

}
