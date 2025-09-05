import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ProductsRoutingModule } from "./products-routing.module";
import { ProductListComponent } from "./physical/product-list/product-list.component";
import { AddProductComponent } from "./physical/add-product/add-product.component";
import { ProductDetailComponent } from "./physical/product-detail/product-detail.component";
import { GalleryModule } from "@ks89/angular-modal-gallery";

//import { NgxDropzoneModule } from "ngx-dropzone";
import { SharedModule } from "../../shared/shared.module";

import { NgxEditorModule } from 'ngx-editor';
import { MultiCheckboxDropdownComponent } from "../multi-checkbox-dropdown/multi-checkbox-dropdown.component";
import { UrlDataFetcherComponent } from "../url-data-fetcher/url-data-fetcher.component";
import { ImageUploaderComponent } from "./extensions/image-uploader/image-uploader.component";
import { VariantSelectorComponent } from "./extensions/variant-selector/variant-selector.component";
import { EditorComponent } from "./extensions/editors/editor.component";
import { UrlProductFetcherComponent } from "./extensions/url-product-fetcher/url-product-fetcher.component";
import { StorytellerEditorComponent } from "./extensions/storyteller-editor/storyteller-editor.component";
import { BundleEditorComponent } from "./extensions/bundle-editor/bundle-editor.component";


@NgModule({
    declarations: [
        ProductListComponent,
        AddProductComponent,
        ImageUploaderComponent,
        VariantSelectorComponent,
        EditorComponent,
        UrlProductFetcherComponent,
        ProductDetailComponent,
        MultiCheckboxDropdownComponent,
        UrlDataFetcherComponent,
        StorytellerEditorComponent,
        BundleEditorComponent
    ],

    imports: [
        //Ng2SearchPipeModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ProductsRoutingModule,
        NgbModule,
        GalleryModule,
        NgxEditorModule,
       // NgxDropzoneModule,
        SharedModule
    ],
    providers: [NgbActiveModal],
})
export class ProductsModule { }
