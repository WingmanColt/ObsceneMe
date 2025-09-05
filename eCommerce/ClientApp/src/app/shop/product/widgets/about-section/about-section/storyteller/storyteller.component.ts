import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { ProductDetails } from 'src/app/shared/classes/productDetails';
import { StoryBlock, StoryPage } from 'src/app/shared/classes/products/storyBlock';

@Component({
  selector: 'app-storyteller',
  templateUrl: './storyteller.component.html',
  styleUrls: ['./storyteller.component.scss'],
  encapsulation: ViewEncapsulation.None  
})
export class StorytellerComponent implements OnInit {
  @Input() product: ProductDetails = {};

  storyPage: StoryPage;
  storyBlocks: StoryBlock[] = [];
  isLoading = true;
  isMobile: boolean;

  htmlPreview: SafeHtml = '';

  constructor(
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private breakpointService: BreakpointDetectorService
  ) {}

  async ngOnInit() {
    this.isMobile = this.breakpointService.isDevice('Mobile');

    if (this.product?.storyPage?.html && this.product.storyPage.html.length > 10) {
      let rawHtml = this.product.storyPage.html;

      // First translate {{ 'key' | translate }} placeholders
      rawHtml = await this.translateCurlyBraces(rawHtml);

      // Then translate __TRANSLATE_key__ placeholders (e.g. alt attributes)
      rawHtml = await this.translatePlaceholders(rawHtml);

      this.htmlPreview = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
      this.storyBlocks = []; // clear blocks to prevent duplicate rendering
    } else {
      this.storyBlocks = (this.product?.storyPage?.blocks || []).map(block => ({
        ...block,
        content: typeof block.content === 'string' ? JSON.parse(block.content) : block.content
      }));
    }

    this.storyPage = this.product.storyPage;
    this.isLoading = false;
  }

private async translateCurlyBraces(rawHtml: string): Promise<string> {
  const regex = /{{\s*(['"])(.*?)\1\s*\|\s*translate\s*}}/g;

  // Collect unique keys
  const keys = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawHtml)) !== null) {
    keys.add(match[2]);
  }

  if (keys.size === 0) return rawHtml;

  const translations = await this.translate.get(Array.from(keys)).toPromise();

  let translatedHtml = rawHtml;
  keys.forEach(key => {
    // Escape regex special chars in key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`{{\\s*(['"])${escapedKey}\\1\\s*\\|\\s*translate\\s*}}`, 'g');
    translatedHtml = translatedHtml.replace(pattern, translations[key]);
  });

  return translatedHtml;
}


  private async translatePlaceholders(rawHtml: string): Promise<string> {
    // Matches placeholders like __TRANSLATE_key__
    const placeholderRegex = /__TRANSLATE_([a-zA-Z0-9_.-]+)__/g;

    // Collect unique keys
    const keys = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = placeholderRegex.exec(rawHtml)) !== null) {
      keys.add(match[1]);
    }

    if (keys.size === 0) return rawHtml;

    const translations = await this.translate.get(Array.from(keys)).toPromise();

    let translatedHtml = rawHtml;
    keys.forEach(key => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`__TRANSLATE_${escapedKey}__`, 'g');
      translatedHtml = translatedHtml.replace(pattern, translations[key]);
    });

    return translatedHtml;
  }

playVideo(block: any): void {
  block.isPlaying = true;
  block.videoUrl = this.appendYouTubeParams(block.videoUrl);
}

appendYouTubeParams(url: string): string {
  const videoId = this.extractYouTubeId(url);
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&showinfo=0&disablekb=1&iv_load_policy=3`;
}

getYouTubeThumbnail(url: string): string {
  const id = this.extractYouTubeId(url);
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

extractYouTubeId(url: string): string {
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}

getSafeVideoUrl(url: string): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

}
