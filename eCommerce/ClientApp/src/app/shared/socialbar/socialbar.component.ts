import { Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-socialbar',
  templateUrl: './socialbar.component.html',
  styleUrls: ['./socialbar.component.scss']
})

export class SocialbarComponent {
  settings = environment;

  get hasInstagram(): boolean {
    return !!this.settings?.socialSettings.instagramProfileUrl;
  }

  get hasFacebook(): boolean {
    return !!this.settings?.socialSettings.facebookProfileUrl;
  }

  get hasTwitter(): boolean {
    return !!this.settings?.socialSettings.twitterProfileUrl;
  }

  get hasYoutube(): boolean {
    return !!this.settings?.socialSettings.youtubeChannelUrl;
  }

  get hasTikTok(): boolean {
    return !!this.settings?.socialSettings.tiktokChanenlUrl;
  }

  get instagramUrl(): string {
    return this.settings?.socialSettings.instagramProfileUrl || '';
  }

  get facebookUrl(): string {
    return this.settings?.socialSettings.facebookProfileUrl || '';
  }

  get twitterUrl(): string {
    return this.settings?.socialSettings.twitterProfileUrl || '';
  }

  get youtubeUrl(): string {
    return this.settings?.socialSettings.youtubeChannelUrl || '';
  }

  get tiktokUrl(): string {
    return this.settings?.socialSettings.tiktokChanenlUrl || '';
  }
}
