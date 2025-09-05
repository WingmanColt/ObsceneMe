import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  from,
  lastValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  switchMap
} from "rxjs";
import { WebApiUrls } from "../../configs/webApiUrls";
import { CartItemState } from "../../shared/classes/cart";
import { Products } from "../../shared/classes/product";
import { LocalStorageService } from "../LocalStorage/local-storage.service";

const state = {
  cart: JSON.parse(localStorage["cartItems"] || "[]"),
};

@Injectable({
  providedIn: "root",
})
export class CartService {
  // Cached cart
  private cartCache: Array<CartItemState> = [];

  // Subject for manually triggering data refresh.
  private _triggerFetch$ = new BehaviorSubject<void>(undefined);

  // Cached observable for the cart products.
  private cartProductsCache$: Observable<[Products[], number]> | null = null;

  private cartLengthSubject = new BehaviorSubject<number>(0);
  cartLength$ = this.cartLengthSubject.asObservable();

  constructor(
    private http: HttpClient,
    private config: WebApiUrls,
    private localStorageService: LocalStorageService
  ) {
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    const cartItems = await this.localStorageService.get("cartItems");
    this.cartCache = cartItems ? cartItems : [];
    this.cartLengthSubject.next(this.cartCache.length);
    // Trigger the fetch after cache initialization.
    this.updateCart();
  }
  

  public async addToCartAsync(
    product: Products, 
    quantity: number, 
    selectedVariants?: any[] | undefined,
    selectedBundle?: any | undefined) : Promise<boolean> {
    if (product == null) return false;

    const qty = quantity > 0 ? quantity : 1;

    if (!this.calculateStockCounts(product, qty)) return false;

    const cartItemIndex = this.cartCache.findIndex(
      (item) => item.productId === product?.id
    );

    if (cartItemIndex !== -1) {
      // Update quantity for existing item in the cart
      this.cartCache[cartItemIndex].customerPreferenceQuantity += qty;
    } else {
      // Add new product to the cart
      this.cartCache.push({ 
        productId: product.id, 
        customerPreferenceQuantity: qty,
        selectedVariants: selectedVariants,
        selectedBundle: selectedBundle
      });
    }

    await this.refreshState();
    this.updateCart();

    return true;
  }

  // Calculate Stock Counts
  public calculateStockCounts(product: Products, quantity): boolean {
    if (product.quantity == 0 || product.quantity < quantity) {
      return false;
    }

    return true;
  }

  public productQuantity(product: Products): Observable<number> {
    // Check if cartCache is an array
    if (!Array.isArray(this.cartCache) || this.cartCache.length === 0)
      return of(0);

    const cartItem = this.cartCache.find(
      (item) => item.productId === product?.id
    );

    return of(cartItem?.customerPreferenceQuantity || 0);
  }

  public async isInCart(product: Products): Promise<CartItemState | undefined> {
    if (!Array.isArray(this.cartCache) || this.cartCache.length === 0)
      return Promise.resolve(undefined);
  
    const cartItem = this.cartCache.find((item) => item.productId === product?.id);
    return Promise.resolve(cartItem);
  }
  

  public getProductQuantity(product: Products): number {
    if (!Array.isArray(this.cartCache) || this.cartCache.length === 0) return 0;

    const cartItem = this.cartCache.find(
      (item) => item.productId === product?.id
    );

    if (cartItem) {
      return cartItem.customerPreferenceQuantity;
    }

    return 0;
  }

  public async changeProductQuantity(product: Products, increment: boolean): Promise<number> {
    const cartItem = this.cartCache.find(
      (item) => item.productId === product?.id
    );
    if (!cartItem) return 0;

    cartItem.customerPreferenceQuantity = increment
      ? cartItem.customerPreferenceQuantity + 1
      : cartItem.customerPreferenceQuantity - 1;
    await this.refreshState();

    return cartItem.customerPreferenceQuantity;
  }

  public get cartProducts$(): Observable<[Products[], number]> {
    if (!this.cartProductsCache$) {
      // Use _triggerFetch$ to control when the data is fetched.
      this.cartProductsCache$ = this._triggerFetch$.pipe(
        switchMap(() => from(this.fetchCartProducts())), // Wrap async call in from()
        map(items => [items, items.length] as [Products[], number]), // Create a tuple of items and count
        shareReplay(1) // Cache the result and share across all subscribers.
      );
    }
    return this.cartProductsCache$;
  }
public getTotalAmount(totalDiscount: number = 0, shippingCost: number = 0): Observable<number> {
  if (!this.cartProducts$) return of(0);

  return this.cartProducts$.pipe(
    map(([products, count]) => {
      return products.reduce((total, product) => {
        if (!product) return total;

        const quantity = this.getProductQuantity(product);

        // 🧠 Check for bundle override
        const bundle = (product as any).selectedBundle?.[0];

        const price = bundle?.price ?? product.price;
        const discountRate = bundle?.discountRate ?? product.discountRate;

        const discountedPrice = this.calculateDiscountedPrice(price, discountRate);
        const totalPriceForProduct = discountedPrice * quantity;

        const productTotal = this.calculateProductTotal(
          totalPriceForProduct,
          totalDiscount,
          shippingCost
        );

        return total + productTotal;
      }, 0) || 0;
    })
  );
}


  private calculateDiscountedPrice(
    price: number,
    discountRate: number
  ): number {
    return discountRate > 0 ? price - discountRate : price;
  }

  private calculateProductTotal(
    totalPriceForProduct: number,
    totalDiscount: number,
    shippingCost: number
  ): number {
    const calculateRate = totalPriceForProduct * totalDiscount;
    const productCalcPriceWithTotalDiscount =
      totalDiscount > 0
        ? totalPriceForProduct - calculateRate + shippingCost
        : totalPriceForProduct + shippingCost;

    return productCalcPriceWithTotalDiscount;
  }

  public async removeCartItem(product: Products): Promise<boolean> {
    const cartItemIndex = this.cartCache.findIndex(
      (item) => item.productId === product?.id
    );

    if (cartItemIndex > -1) {
      this.cartCache.splice(cartItemIndex, 1);
      await this.refreshState();
      this.updateCart();
      return true; // Item successfully removed
    } else {
      return false; // Item not found in the cart
    }
  }

  public async ClearCart(): Promise<void> {
    this.cartCache = [];
    await this.refreshState();
    this.updateCart();
  }

  private async refreshState(): Promise<void> {
    state.cart = [...this.cartCache];
    await this.localStorageService.set("cartItems", JSON.stringify(this.cartCache));
    // Emit the updated cart length
    this.cartLengthSubject.next(this.cartCache.length);
  }

private async fetchCartProducts(): Promise<any[]> {
  const cartItems = await this.localStorageService.get("cartItems");
  const storedCartItems = cartItems ? cartItems : [];

  if (!storedCartItems || storedCartItems.length === 0) return [];

  const fetchedProducts = await lastValueFrom(
    this.http.put<any[]>(this.config.setting["GetCartProducts"], this.cartCache).pipe(
      map((response) => response || []),
      catchError((error) => {
        console.error("Error fetching cart products:", error);
        return of([]);
      })
    )
  );


  // 🧠 Map over fetched products and override with values from localStorage
  const updatedProducts = fetchedProducts.map(product => {
    const localItem = storedCartItems.find(item => item.productId === product.id);

    if (localItem?.selectedBundle?.length > 0) {
      const bundleData = localItem.selectedBundle[0];

      return {
        ...product,
        title: bundleData.title || product.title,
        price: bundleData.price ?? product.price,
        discountRate: bundleData.discountRate ?? product.discountRate,
        image: bundleData.imageSrc || product.image,
        customerPreferenceQuantity: localItem.customerPreferenceQuantity ?? product.customerPreferenceQuantity,
      };
    }
    
    return product;
  });

  return updatedProducts;
}

    
  // Method to invalidate the cache and trigger a refetch.
  public updateCart() {
    // Invalidate the cache.
    this.cartProductsCache$ = null;
    
    // Trigger a refetch by emitting a new value.
    this._triggerFetch$.next();
  }

  public getCartLength(): Observable<number> {
    return of(this.cartCache.length);
  }
}
