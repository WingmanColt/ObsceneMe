import { Component, OnDestroy, OnInit, Renderer2, RendererFactory2 } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { CartService } from "src/app/Services/Cart/cart.service";
import { ProductsService } from "src/app/Services/Product/products.service";
import { Currency } from "../../classes/settings";
import { BaseService } from "src/app/Services/base.service";
import { environment } from "environments/environment";
import { Products } from "../../classes/product";
import { SiblingEventService } from "src/app/Services/Siblings/sibling-event.service";

@Component({
    selector: "app-cart-menu",
    templateUrl: "./cart-menu.component.html",
    styleUrls: ["./cart-menu.component.scss"],
})
export class CartMenuComponent implements OnInit, OnDestroy {
    componentName: string = "CartMenuComponent";
    env = environment;
    settings = this.env.homeSettings;
    renderer: Renderer2;

    specialOffers$: Observable<any>;
    cartItems: Products[] = [];
    cartCount: number = 0;
    loading: boolean = true;

    isRemoving: boolean = false;
    isCartMenuOpen: boolean = false;

    activeCurrency: Currency;
    private destroy$ = new Subject<void>();

    constructor(
        public productsService: ProductsService,
        public cartService: CartService,
        public baseService: BaseService,
        private rendererFactory: RendererFactory2,
        private siblingService: SiblingEventService
    ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    ngOnInit(): void {
        this.initSubscriptions();
    }

    ngOnDestroy(): void {
        this.closeCartMenu();
        this.destroy$.next();
        this.destroy$.complete();
    }

    closeCartMenu(): void {
        this.isCartMenuOpen = false;
        this.baseService.updateMenuState({ isCartMenuOpen: false });

        if (this.settings.myCartSettings.overlay) 
            this.toggleOverlay(false);
    }
      emitProductRemove() {
        this.siblingService.emitChange.emit();
     }

    private initSubscriptions(): void {
        this.cartService.cartProducts$
        .pipe(takeUntil(this.destroy$))
        .subscribe(([products, count]) => {
            this.cartItems = products;
            this.cartCount = count;
            this.loading = false;

        });

        if (this.settings.myCartSettings.showSpecialOffers) {
            this.specialOffers$ = this.productsService.specialOffers$;
        }

        this.baseService.menuState$
        .pipe(takeUntil(this.destroy$))
        .subscribe(menuState => {
            this.isCartMenuOpen = menuState.isCartMenuOpen;

            if (this.settings.myCartSettings.overlay) 
                this.toggleOverlay(menuState.isCartMenuOpen);
            
        });

    }

    private toggleOverlay(set: boolean): void {
        const overflowValue = set ? "hidden" : ""// hardReset || this.navServices.searchBarToggle ? "hidden" : "";
        this.renderer.setStyle(document.documentElement, "overflow", overflowValue);
    }

    async removeItem(product: Products): Promise<void> {
        this.isRemoving = true;
        await this.cartService.removeCartItem(product);
        this.emitProductRemove();
        this.isRemoving = false;
    }
    async toggleCart(): Promise<void> {
       this.isCartMenuOpen = !this.isCartMenuOpen
    }

    async changeQuantity(product: Products, isIncrement: boolean): Promise<void> {
        const currentQuantity = this.cartService.getProductQuantity(product);
        if (isIncrement && currentQuantity < product.quantity) {
            await this.cartService.changeProductQuantity(product, true);
        } else if (!isIncrement && currentQuantity > 1) {
            await this.cartService.changeProductQuantity(product, false);
        }
    }
    calculateStocksCount(product: Products): Observable<number> | undefined {
        return this.cartService.productQuantity(product);
    }
    trackByProductId(index: number, product: Products): number {
        return product.id;
    }

    getTotalAmount(): Observable<number> {
        return this.cartService.getTotalAmount();
    }
}

