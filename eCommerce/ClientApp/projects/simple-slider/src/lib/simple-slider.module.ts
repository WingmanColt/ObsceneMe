import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleSliderComponent } from './simple-slider.component';

@NgModule({
  declarations: [SimpleSliderComponent],
  imports: [CommonModule],
  exports: [SimpleSliderComponent]
})
export class SimpleSliderModule {}
