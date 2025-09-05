import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, shareReplay, switchMap } from 'rxjs';
import { WebApiUrls } from 'src/app/configs/webApiUrls';
import { LocalStorageService } from '../LocalStorage/local-storage.service';
import { Products } from 'src/app/shared/classes/product';
import { CartItemState } from 'src/app/shared/classes/cart';
import { lastValueFrom } from 'rxjs';

const state = {
  favouritesList: JSON.parse(localStorage["favItems"] || "[]"),
};

@Injectable({
  providedIn: 'root'
})
export class FavouritesService {
  
  private favProductsCache: Array<CartItemState> = [];

  private _favProductsData$ = new BehaviorSubject<void>(undefined);
  private favProductsCache$: Observable<any[]> | null = null;

  constructor(
    private http: HttpClient,
    private config: WebApiUrls,
    private localStorageService: LocalStorageService) {
    
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    const favItems = await this.localStorageService.get("favItems");
    this.favProductsCache = favItems?.length > 0 ? favItems : [];
  }

  public async addToFavouritesAsync(product: Products): Promise<boolean> {
    if (!product) {
      return false;
    }

    const existingIndex = this.favProductsCache.findIndex(item => item.productId === product.id);

    if (existingIndex > -1) {
      // Remove the product if it exists
      this.favProductsCache.splice(existingIndex, 1);
    } else {
      // Add the product if it doesn't exist
      this.favProductsCache.push({ productId: product.id });
    }

    await this.refreshState();
    return true;
  }

  public isProductInFavourites(product: Products): Observable<boolean> {
    const isInFavourites = this.favProductsCache.some(item => item.productId === product?.id);
    return of(isInFavourites);
  }

  private async refreshState(): Promise<void> {
    state.favouritesList = [...this.favProductsCache];
    await this.localStorageService.set("favItems", JSON.stringify(this.favProductsCache));
    this.updateFavourites();
  }

  public get favProducts$(): Observable<any[]> {
    if (!this.favProductsCache$) {
      this.favProductsCache$ = this._favProductsData$.pipe(
        switchMap(() => this.fetchFavourites()), // Fetch favourites when triggered
        shareReplay(1) // Cache the result and share across subscribers
      );
    }
    return this.favProductsCache$;
  }

  private async fetchFavourites(): Promise<any[]> {
    // Check if favourite items exist in localStorage.
    const favItems = await this.localStorageService.get("favItems");
    const storedFavItems = favItems ? favItems : [];

    // If no products are found in localStorage, return an empty array and avoid the API call.
    if (!storedFavItems || storedFavItems.length === 0) {
      return []; // Return an empty array if no items are found in localStorage.
    }

    // If products exist in localStorage, proceed with the API request.
    return lastValueFrom(this.http.put<any[]>(this.config.setting["GetCartProducts"], this.favProductsCache).pipe(
      shareReplay(1), // Cache the response for reuse
      catchError((error) => {
        console.error("Error fetching favourite products:", error);
        return of([]); // Return an empty array on error
      })
    ));
  }

  public updateFavourites() {
    this._favProductsData$.next();
  }

  public getFavouriteList(): Observable<CartItemState[]> {
    return of(this.favProductsCache);
  }
}
