import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AdminProductsService } from 'projects/admin/src/app/services/Product/products.service';
import { ProductsService } from 'src/app/Services/Product/products.service';
import { EditableStoryBlock, StoryBlock, StoryPage } from 'src/app/shared/classes/products/storyBlock';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-storyteller-editor',
  templateUrl: './storyteller-editor.component.html',
  styleUrls: ['./storyteller-editor.component.scss']
})
export class StorytellerEditorComponent implements OnInit {
  @Input() productId: number;
  @Output() storyChanged = new EventEmitter<StoryPage>();

  storyBlocks: EditableStoryBlock[] = [];
  story: StoryPage = {
    template: 'default',
    style: 'light',
    html: '',
    blocks: []
  };
  storyMode: 'block' | 'html' = 'block';
  previewHtml: SafeHtml = '';

  constructor(
    private sanitizer: DomSanitizer,
    private productService: ProductsService,
    private adminProductServices:AdminProductsService
  ) {}

  ngOnInit(): void {
    if (this.productId > 0) {
      this.loadStory();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId > 0) {
      this.loadStory();
    }
  }

  async loadStory(): Promise<void> {
    try {
      const story = await this.productService.getStoryPage(this.productId);
      this.story = {
        template: story.template || 'default',
        style: story.style || 'light',
        html: story.html || '',
        blocks: story.blocks || []
      };

      this.storyMode = story.html ? 'html' : 'block';

      this.storyBlocks = (this.story.blocks || []).map(block => ({
        ...block,
        contentString: Array.isArray(block.content) ? block.content.join('\n') : ''
      }));

      this.emitStoryUpdate();
    } catch (error) {
      console.error('Error loading story', error);
      this.story = { template: 'default', style: 'light', html: '', blocks: [] };
      this.storyBlocks = [];
    }
  }

  onStoryModeChange() {
    this.emitStoryUpdate();
  }

  addBlock() {
    this.storyBlocks.push({
      id: uuidv4(),
      type: 'text',
      heading: '',
      content: [],
      contentString: '',
      image: '',
      videoUrl: '',
      customHtml: ''
    });
    this.emitStoryUpdate();
  }

  removeBlock(index: number) {
    this.storyBlocks.splice(index, 1);
    this.emitStoryUpdate();
  }

  updateBlockContent(block: EditableStoryBlock) {
    block.content = (block.contentString || '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    this.emitStoryUpdate();
  }

  async save(): Promise<void> {
    const storyToSave: StoryPage = {
      template: this.story.template,
      style: this.story.style,
      html: this.storyMode === 'html' ? this.story.html : this.generateFullHtml(),
      blocks: this.storyMode === 'html'
        ? []
        : this.storyBlocks.map(({ contentString, ...b }) => b)
    };

    await this.adminProductServices.saveStoryPage(this.productId, storyToSave);
  }

  emitStoryUpdate() {
    const blocks = this.storyBlocks.map(({ contentString, ...b }) => ({
      ...b,
      content: contentString
        ? contentString.split('\n').map(l => l.trim()).filter(Boolean)
        : []
    }));

    const html = this.storyMode === 'html' ? this.story.html : this.generateFullHtml();
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);

    this.storyChanged.emit({
      template: this.story.template,
      style: this.story.style,
      html,
      blocks: this.storyMode === 'html' ? [] : blocks
    });
  }

  generateFullHtml(): string {
    let html = `<div class="container-xxl g-0" style="max-width: 1600px;">\n<div class="row">\n<div class="col-12 mx-auto">\n<div class="rich-theme ${this.story.style === 'dark' ? 'theme-dark' : ''}">\n`;

    for (const block of this.storyBlocks) {
      switch (block.type) {
        case 'title':
          html += `<section class="story-block"><h2>${block.heading || ''}</h2></section>\n`;
          break;
        case 'text':
          html += `<section class="story-block"><div>${(block.content || []).map(p => `<p>${p}</p>`).join('')}</div></section>\n`;
          break;
        case 'image-left':
          html += `<section class="story-block image-left"><div><img src="${block.image}" /><div>${block.heading ? `<h2>${block.heading}</h2>` : ''}${(block.content || []).map(p => `<p>${p}</p>`).join('')}</div></div></section>\n`;
          break;
        case 'image-right':
          html += `<section class="story-block image-right"><div>${block.heading ? `<h2>${block.heading}</h2>` : ''}</div><img src="${block.image}" /></section>\n`;
          break;
        case 'video':
        html += `<section class="story-block video">\n`;
        if (block.heading) {
          html += `<h2>${block.heading}</h2>\n`;
        }
        if (block.videoUrl) {
          html += `<div class="video-wrapper"><iframe src="${block.videoUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe></div>\n`;
        }
        html += `</section>\n`;
        break;
        case 'list':
          html += `<section class="story-block"><ul>${(block.content || []).map(i => `<li>${i}</li>`).join('')}</ul></section>\n`;
          break;
        case 'notes':
          html += `<section class="story-block notes"><strong>${block.heading || ''}</strong><br>${(block.content || []).join('<br>')}</section>\n`;
          break;
        case 'custom':
          html += `<section class="story-block custom">${block.customHtml || ''}</section>\n`;
          break;
      }
    }

    html += `</div>\n</div>\n</div>\n</div>`;
    return html;
  }
}
