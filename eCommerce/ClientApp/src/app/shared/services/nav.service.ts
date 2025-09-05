import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { ProductsService } from "src/app/Services/Product/products.service";
import { environment } from "environments/environment";
import { Menu } from "../classes/menu";

@Injectable({
 providedIn: "root",
})
export class NavService implements OnDestroy {
 private env = environment;
 public categories: Menu[] = [];
 public g_sub: Subscription;

 public mainMenuToggle: boolean = false;
 public leftMenuToggle: boolean = false;
 public searchBarToggle: boolean = false;

 public MENUITEMS: Menu[] = this.env.setting.menu;

 items = new BehaviorSubject<Menu[]>(this.MENUITEMS);

 constructor(private productsService: ProductsService) {
  /*
  const subCategories = this.productsService.categoriesWithSubs$
  .pipe(
    tap((entityArray: Category[]) => {
      this.categories = entityArray.map((category) => this.setCategoryProperties(category));
    })
  )
  .subscribe((x) => {this.categories = x});
  */
 /* this.g_sub = this.productsService.categoriesWithSubs$.subscribe((response) => {
   if (response != null) {

    response.forEach((ent) => {

     console.log(response)
     this.categories.push({
      id: ent.id,
      //path: "/shop?category=" + ent.id,
      title: ent.title,
      type: "extLink",
      image: "las la-" + ent.icon,
     });
    });

    this.env.setting.menu.map((x) => (x.children = this.categories));
   }
  });*/
 }
 ngOnDestroy(): void {
 // if (this.g_sub && !this.g_sub.closed) this.g_sub.unsubscribe();
 }

 
}
