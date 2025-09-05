import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryComponent } from './category/category.component';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { BrandComponent } from './brands/brand.component';
import { OccasionComponent } from './occasions/occasion.component';
import { SubBrandComponent } from './subBrands/subBrand.component';
import { SeriesComponent } from './Series/Series.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'categories',
        component: CategoryComponent,
        data: {
          title: "Category",
          breadcrumb: "Category"
        }
      },
      {
        path: 'sub-categories',
        component: SubCategoryComponent,
        data: {
          title: "Sub Category",
          breadcrumb: "Sub Category"
        }
      },
      {
        path: 'brands',
        component: BrandComponent,
        data: {
          title: "Brands",
          breadcrumb: "Brands"
        }
      },
      {
        path: 'sub-brands',
        component: SubBrandComponent,
        data: {
          title: "Sub Brands",
          breadcrumb: "Sub Brands"
        }
      },
      {
        path: 'occasions',
        component: OccasionComponent,
        data: {
          title: "Occasions",
          breadcrumb: "Occasions"
        }
      },
      {
        path: 'series',
        component: SeriesComponent,
        data: {
          title: "Series",
          breadcrumb: "Series"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatabaseRoutingModule { }
