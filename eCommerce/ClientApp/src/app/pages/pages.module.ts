import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { PagesRoutingModule } from "./pages-routing.module";

// Pages Components
import { AboutUsComponent } from "./about-us/about-us.component";
import { ErrorComponent } from "./error/error.component";
import { FaqComponent } from "./faq/faq.component";
import { ReturnsWarrantyComponent } from "./returns-warranty/returns-warranty.component";
import { PrivacyComponent } from "./privacy/privacy.component";
import { ContactComponent } from "./contact/contact.component";
import { RegisterAffiliateAccountComponent } from './register-affiliate-account/register-affiliate-account.component';
import { UserInfoComponent } from "./account/user-info/user-info.component";
import { PipesModule } from "../shared/pipes/pipes.module";
import { HistoryCardComponent } from "./account/user-info/history-card/history-card.component";
import { GiftShuffleComponent } from "./gift-shuffle/gift-shuffle.component";
import { SlotMachineComponent } from "./gift-shuffle/templates/slot-machine/slot-machine.component";
import { GiftCardsCarouselComponent } from "./gift-shuffle/gift-cards-carousel/gift-cards-carousel.component";
import { CategoriesPageComponent } from "./categories/categories.component";
import { PrivateOfficeOrdersComponent } from "./account/user-info/pages/private-office-orders/private-office-orders.component";
import { PrivateOfficeSettingsComponent } from "./account/user-info/pages/private-office-settings/private-office-settings.component";
import { PrivateOfficeWishlistComponent } from "./account/user-info/pages/private-office-wishlist/private-office-wishlist.component";
import { PrivateOfficeDashboardComponent } from "./account/user-info/pages/private-office-dashboard/private-office-dashboard.component";
import { PrivateOfficeGuideComponent } from "./account/user-info/pages/private-office-guide/private-office-guide.component";
import { NgChartsModule } from "ng2-charts";
import { PrivateOfficePaymentsComponent } from "./account/user-info/pages/private-office-payments/private-office-payments.component";
import { ReviewsPageComponent } from "./reviews-page/reviews-page.component";
import { JdgmWidgetComponent } from "./reviews-page/widgets/jdgm-widget/jdgm-widget.component";
import { StoryGalleryComponent } from "./reviews-page/widgets/story-gallery/story-gallery.component";
import { NotFoundComponent } from "../shared/components/404/404.component";

@NgModule({
    declarations: [
        AboutUsComponent,
        ErrorComponent,
        FaqComponent,
        ReturnsWarrantyComponent,
        PrivacyComponent,
        ContactComponent,
        RegisterAffiliateAccountComponent,
        UserInfoComponent,
        HistoryCardComponent,
        GiftShuffleComponent,
        SlotMachineComponent,
        GiftCardsCarouselComponent,
        CategoriesPageComponent,
        PrivateOfficeOrdersComponent,
        PrivateOfficeSettingsComponent,
        PrivateOfficeWishlistComponent,
        PrivateOfficeDashboardComponent,
        PrivateOfficeGuideComponent,
        PrivateOfficePaymentsComponent,
        ReviewsPageComponent,
        JdgmWidgetComponent,
        StoryGalleryComponent
        
    ],
    imports: [NgChartsModule, CommonModule, PipesModule, NgOptimizedImage, SharedModule, PagesRoutingModule]
})
export class PagesModule { }
