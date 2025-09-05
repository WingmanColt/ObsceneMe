import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-url-data-fetcher',
  templateUrl: './url-data-fetcher.component.html',
  styleUrls: ['./url-data-fetcher.component.scss']
})
export class UrlDataFetcherComponent {
  url: string = '';
  product: any = null;
  errorMessage: string = '';

  constructor(private http: HttpClient) { }

  fetchData() {
    if (this.url) {
      const backendUrl = `http://localhost:3000/fetch-url?url=${encodeURIComponent(this.url)}`;
      this.http.get(backendUrl, { responseType: 'text' }).subscribe(
        data => this.parseHtml(data),
        error => {
          console.error('Error fetching data', error);
          this.errorMessage = `Error fetching data: ${error.message}\nStatus: ${error.status}\nStatus Text: ${error.statusText}`;
        }
      );
    }
  }

  parseHtml(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract the title
    const titleElement = doc.querySelector('h1[data-pl="product-title"]');
    const title = titleElement ? titleElement.textContent : 'No title found';
  
    // Extract the price
    const priceElement = doc.querySelector('div[data-pl="product-price"] .price--currentPriceText--V8_y_b5');
    let price = priceElement ? priceElement.textContent : 'No price found';
    price = this.removeNonNumeric(price);
  
    // Extract the discount
    const discountElement = doc.querySelector('.price--original--wEueRiZ .price--discount--Y9uG2LK');
    let discount = discountElement ? discountElement.textContent : 'No discount found';
    discount = this.removeNonNumeric(discount);
  
    // Query the images inside the slider--wrap--krlZ7X9 div
    const imageElements = doc.querySelectorAll('.slider--wrap--krlZ7X9 img');
    const images = Array.from(imageElements).map((el: Element) => ({
      src: el.getAttribute('src')
    }));
  
    // Extract the product description
    const description = this.extractDescription(doc);
    console.log('Extracted Description:', description); // Debugging line
  
    this.product = {
      title: this.truncateTitle(title, 50),
      images: images,
      about: title,
      price: price,
      discountRate: discount,
      description: description
    };
  }
  extractDescription(doc: Document): string {
    const descriptionElement = doc.querySelector('#nav-description');

    if (!descriptionElement) {
      return 'No description available';
    }

    // Get the entire HTML content of the description element
    const descriptionContent = descriptionElement.innerHTML;

    // Parse the description content as needed or return as is
    return descriptionContent;
  }

  truncateTitle(title: string, maxLength: number): string {
    if (title.length <= maxLength) {
      return title;
    }

    const truncated = title.substr(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex === -1) {
      return truncated; // No space found, returning as it is
    }

    return truncated.substr(0, lastSpaceIndex);
  }

  removeNonNumeric(price: string): string {
    return price.replace(/[^\d.]/g, '').trim();
  }
}
