import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleSliderComponent2 } from './simple-slider.component';
import { SafeUrlPipe } from './safeUrl.directive';

@NgModule({
  declarations: [SafeUrlPipe],
  imports: [CommonModule],
  exports: [SafeUrlPipe]
})
export class SimpleSliderModule {}
