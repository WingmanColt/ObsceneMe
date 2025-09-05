import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { DatabaseRoutingModule } from "./database-routing.module";
import { CategoryComponent } from "./category/category.component";
import { SubCategoryComponent } from "./sub-category/sub-category.component";

import { SharedModule } from "../../shared/shared.module";

import { BrandComponent } from "./brands/brand.component";
import { OccasionComponent } from "./occasions/occasion.component";
import { SubBrandComponent } from "./subBrands/subBrand.component";
import { SeriesComponent } from "./Series/Series.component";

@NgModule({
    declarations: [
        CategoryComponent,
        SubCategoryComponent,
        BrandComponent,
        SubBrandComponent,
        OccasionComponent,
        SeriesComponent
    ],

    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DatabaseRoutingModule,
        NgbModule,
        SharedModule
    ],
    providers: [NgbActiveModal],
})
export class DatabaseModule { }
