import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-modal-auth-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss'],
})
export class AuthResponseComponent implements OnInit {
  componentName = 'AuthResponseComponent';

  settings = environment;
  logoPath = this.settings.setting.logoPath;
  logoSizes = this.settings.setting.logoSizes;

  @Output() pageChange = new EventEmitter<string>();

  // Track status: 'loading' | 'success' | 'error'
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor() {}

  ngOnInit(): void {
    // Simulate sequence of animations
    setTimeout(() => {
      this.status = 'success';
    }, 2000);

    // Example: revert to loading or error after some time
    // setTimeout(() => {
    //   this.status = 'error';
    // }, 5000);
  }

  switchPage(page: string) {
    this.pageChange.emit(page);
  }

  onEnterKey(event: KeyboardEvent) {
    event.preventDefault();
  }

  getLogoUrl(sizeIndex: number = 0): string {
    const logo = this.logoSizes[sizeIndex] ?? '';
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    return this.logoPath + logo;
  }
}
