import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { environment } from 'environments/environment';
import { Product } from 'src/app/shared/classes/product';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-url-product-fetcher',
  templateUrl: './url-product-fetcher.component.html',
  styleUrls: ['./url-product-fetcher.component.scss']
})
export class UrlProductFetcherComponent implements OnDestroy {
  @Output() fetchedDataOutput = new EventEmitter<any>();
  
  env = environment;
  url: string = '';
  selectedSite: string = 'temu'; // Default site
  product: Product | undefined;
  errorMessage: string = '';
  isLoading: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  fetchData() {
    if (this.url) {
      this.isLoading = true;
      this.errorMessage = '';

      const backendUrl = this.getBackendUrl();
      this.http.get(backendUrl, { responseType: 'text' })
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          data => this.parseHtml(data),
          error => {
            console.error('Error fetching data', error);
            this.errorMessage = `Error fetching data: ${error.message}\nStatus: ${error.status}\nStatus Text: ${error.statusText}`;
            this.isLoading = false;
          }
        );
    }
  }

  getBackendUrl(): string {
    switch (this.selectedSite) {
      case 'temu':
        return `http://localhost:3123/fetch-temu?url=${encodeURIComponent(this.url)}`;
      case 'aliexpress':
        return `http://localhost:3123/fetch-ali?url=${encodeURIComponent(this.url)}`;
        default: return ` `; 

    }
  }

  updateSite() {
    // This method can be used to handle any site-specific initialization if needed
  }

  parseHtml(html: string) {
    this.isLoading = false;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    console.log(doc)

    // Site-specific parsing logic
    switch (this.selectedSite) {
      case 'temu':
        this.parseTemuHtml(doc); break;
      case 'aliexpress': 
      this.parseAliExpressHtml(doc); break;
    }
  }

  parseAliExpressHtml(doc: Document) {
    // AliExpress parsing logic here
    const titleElement = doc.querySelector('h1[data-pl="product-title"]');
    const title = titleElement ? titleElement.textContent : 'No title found';

    const priceElement = doc.querySelector('div[data-pl="product-price"] .price--currentPriceText--V8_y_b5');
    let price = this.removeNonNumeric(priceElement?.textContent ?? '');

    const discountElement = doc.querySelector('.price--original--wEueRiZ .price--discount--Y9uG2LK');
    let discount = this.removeNonNumeric(discountElement?.textContent ?? '');

    const imageElements = doc.querySelectorAll('.slider--wrap--krlZ7X9 img');
    const images = Array.from(imageElements).map((el: Element) => {
      let src = el.getAttribute('src');
      if (src) {
        src = src.replace(/\d+x\d+/, '800x800');
      }
      return {
        src: src,
        isExternal: true
      };
    });

    const description = this.extractDescription(doc);

    this.product = {
      title: this.truncateTitle(title, 50),
      images: images,
      about: title,
      description: description,
      price: price,
      discountRate: discount
    };

    console.log(this.product)

    this.fetchedDataOutput.emit(this.product);
  }

  parseTemuHtml(doc: Document) {
    // Extract the title
    const titleElement = doc.querySelector('div._2rn4tqXP');
    const title = titleElement ? titleElement.textContent.trim() : 'No title found';

    // Extract the price
    const priceElement = doc.querySelector('div._3cZnvUvE');
    let price ;
    if (priceElement && priceElement instanceof HTMLElement) {
        price = priceElement.getAttribute('aria-label') || '';
        price = this.removeNonNumeric(price);
    }

    // Extract the required <li> elements
    const listItems = doc.querySelectorAll('nav._2xXsvHW_._3YTayS2z > ol > li');
    let nodeValue1;
    let nodeValue2;
    
    if (listItems && listItems.length >= 3) {
       // category = listItems[1].querySelector('a') ? listItems[1].querySelector('a').textContent.trim() : 'No content';
       // subCategory = listItems[2].querySelector('a') ? listItems[2].querySelector('a').textContent.trim() : 'No content';

        const category =  listItems[1].querySelector('a');
        // Get the text node inside the <a> element
        let textNode1 = category.firstChild;
        // Extract the nodeValue from the text node
        nodeValue1 = textNode1.nodeValue;
    
        // Access the <a> element inside the <li> at index 2
        const subCategory = listItems[2].querySelector('a');
        // Get the text node inside the <a> element
        let textNode2 = subCategory.firstChild;
        // Extract the nodeValue from the text node
        nodeValue2 = textNode2.nodeValue;

    }


    // Function to check if a URL is a placeholder image
    function isPlaceholder(src: string): boolean {
        const placeholderPatterns = [
            'placeholder', // Common term used in placeholder images
            'default', // Common term used in default images
            'data:image', // Base64 encoded images
            'no_image' // Sometimes used in URLs indicating no image available
        ];
        return placeholderPatterns.some(pattern => src.toLowerCase().includes(pattern));
    }

    // Extract images and filter out placeholder images
    const imageElements = doc.querySelectorAll('img');
    const images = Array.from(imageElements)
        .filter((img) => {
            const altText = (img as HTMLImageElement).alt || '';
            const src = (img as HTMLImageElement).src || '';
            return src.startsWith('https://img.kwcdn.com') && !isPlaceholder(src); // Check if alt attribute is similar to title and not a placeholder
        })
        .map((img) => {
            let src = (img as HTMLImageElement).src;
            if (src) {
              src = src.replace(/\/w\/\d+/, '/w/800');
            }
            return {
                src: src,
                isExternal: true
            };
        })
        .filter(image => image.src); // Filter out any objects with empty src attributes

    console.log('Image sources:', images);
    console.log('Title:', title);

    const description = this.extractDescription(doc);

    this.product = {
        title: this.truncateTitle(title, 50),
        about: title,
        description: description,
        images: images, // Updated to include extracted images
        category: nodeValue1,
        subCategory: nodeValue2,
        price: price,
        discountRate: 0
    };

    this.fetchedDataOutput.emit(this.product);
}







  extractDescription(doc: Document): string {
    const descriptionElement = doc.querySelector('.product-description');
    if (!descriptionElement) {
      return 'No description available';
    }
    return descriptionElement.innerHTML;
  }

  truncateTitle(title: string, maxLength: number): string {
    if (title.length <= maxLength) {
      return title;
    }
    const truncated = title.substr(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex === -1) {
      return truncated;
    }
    return truncated.substr(0, lastSpaceIndex);
  }

  removeNonNumeric(price: string): number {
    const numericString = price.replace(/[^\d.]/g, '').trim();
    return parseFloat(numericString);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
