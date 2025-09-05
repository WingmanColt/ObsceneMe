import { Component, Input, ViewChild, ElementRef, OnInit } from "@angular/core";
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { MarketStatus, PremiumPackage, Products } from "../../../classes/product";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";
import { FavouritesService } from "src/app/Services/Favourites/favourites.service";

@Component({
    selector: "app-product-box-rounded",
    templateUrl: "./product-box-rounded.component.html",
    styleUrls: ["./product-box-rounded.component.scss"],
})

export class ProductBoxRoundedComponent implements OnInit {
    @Input() product: Products;
    @Input() multiButtons: boolean;
    @Input() class: string;

    @ViewChild("el") element: ElementRef;
    @ViewChild("quickView") QuickView: QuickViewComponent;

    MarketStatus = MarketStatus;
    PremiumPackage = PremiumPackage;

    defaultImage: string = environment.placeholderSrc;
    env = environment;
    settings = this.env.cardsSettings.cardCleanSettings;

    hover: boolean = false;
    //isInFavourites$: Observable<boolean>;

    currentImageIndex: number = 0;
    rotationCount: number = 0;
    intervalId: any;

    constructor(public baseService: BaseService, private favouriteService: FavouritesService) {
    }
    ngOnInit(): void {
        // this.isInFavourites$ = this.favouriteService.isProductInFavourites(this.product);

    }

    onMouseEnter(): void {
        this.hover = true;
        this.startImageRotation();
    }

    onMouseLeave(): void {
        this.hover = false;
        this.stopImageRotation();
        this.rotationCount = 0;
    }

    startImageRotation(): void {
        this.intervalId = setInterval(() => {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images?.length;
            this.rotationCount++;

            if (this.rotationCount >= this.product.images?.length) {
                this.stopImageRotation();
                this.hover = false; // Optional: if you want to hide the progress bar after rotation is complete
            }
        }, 1000);
    }

    stopImageRotation(): void {
        clearInterval(this.intervalId);
    }

    getAnimationDuration(): string {
        return `${(this.product?.images?.length || 0) * 1000}ms`;
    }

    async addOrRemoveFavourite(): Promise<void> {
        await this.favouriteService.addToFavouritesAsync(this.product);
    }

}
