import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SimpleSliderService {
  private _config = {
    autoPlay: false,
    delay: 5000,
    loop: true
  };

  setConfig(config: Partial<typeof this._config>) {
    this._config = { ...this._config, ...config };
  }

  get config() {
    return this._config;
  }

  // Event handlers
  onSlideChange(index: number) {
    console.log('Slide changed to:', index);
  }
}
