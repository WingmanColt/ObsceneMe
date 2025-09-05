import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductListComponent } from './physical/product-list/product-list.component';
import { AddProductComponent } from './physical/add-product/add-product.component';
import { ProductDetailComponent } from './physical/product-detail/product-detail.component';
import { UrlDataFetcherComponent } from '../url-data-fetcher/url-data-fetcher.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'physical/product-list',
        component: ProductListComponent,
        data: {
          title: "Product List",
          breadcrumb: "Product List"
        }
      },
      {
        path: 'physical/product-detail',
        component: ProductDetailComponent,
        data: {
          title: "Product Detail",
          breadcrumb: "Product Detail"
        }
      },
      {
        path: 'physical/add-product',
        component: AddProductComponent,
        data: {
          title: "Add Products",
          breadcrumb: "Add Product"
        }
      },
      {
        path: 'physical/update-product/:id',
        component: AddProductComponent,
        data: {
          title: "Update Product",
          breadcrumb: "Update Product"
        }
      },
      {
        path: 'physical/copy-product',
        component: UrlDataFetcherComponent,
        data: {
          title: "Copy Product",
          breadcrumb: "Copy Product"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
