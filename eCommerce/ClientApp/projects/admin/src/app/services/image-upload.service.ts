import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private env = environment;

  constructor() {}

  getImageFull(imageSrc: string, productId: number): string {
    // Check for null, undefined, or empty imageSrc and return placeholderSrc if true
    if (!imageSrc || imageSrc.trim().length === 0) {
      return this.env.placeholderSrc;
    }
  
    // Otherwise, return the full image URL
    return this.getImageSrc(imageSrc, productId);
  }
  
  private getImageSrc(imageSrc: string, productId: number): string {
    // Check for null or undefined imageSrc and return placeholderSrc if true
    if (!imageSrc || imageSrc.trim().length === 0) {
      return this.env.placeholderSrc;
    }
  
    // If imageSrc starts with "http", return it as is, else build the full URL
    const baseUrl = `https://localhost:44312/assets/images/products`; // Replace with the actual base URL
  
    return imageSrc.startsWith("http") 
      ? imageSrc 
      : `${baseUrl}/${productId}/${imageSrc}`;
  }
  
}
