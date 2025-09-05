import { Component, Input } from '@angular/core';
import { ProductReviewCard } from 'src/app/shared/classes/reviewCard';

@Component({
  selector: 'app-jdgm-widget',
  templateUrl: './jdgm-widget.component.html',
  styleUrl: './jdgm-widget.component.scss'
})
export class JdgmWidgetComponent {
@Input() reviews: ProductReviewCard[] = [];

}
