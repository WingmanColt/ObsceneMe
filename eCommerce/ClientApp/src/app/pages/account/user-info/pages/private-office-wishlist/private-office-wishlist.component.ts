import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FavouritesService } from 'src/app/Services/Favourites/favourites.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-private-office-wishlist',
  templateUrl: './private-office-wishlist.component.html',
  styleUrl: './private-office-wishlist.component.scss'
})
export class PrivateOfficeWishlistComponent implements OnInit  {
  favProducts$: Observable<any[]>;
  isLoading: boolean = true;
  hasData: boolean = false;

  constructor(private favouriteService: FavouritesService) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    // simulate 300ms delay for better UX loading feedback
    this.favouriteService.favProducts$.pipe(delay(300)).subscribe(products => {
      this.hasData = !!products && products.length > 0;
      this.isLoading = false;
    });

    // still assign async for template binding
    this.favProducts$ = this.favouriteService.favProducts$;
  }
}
