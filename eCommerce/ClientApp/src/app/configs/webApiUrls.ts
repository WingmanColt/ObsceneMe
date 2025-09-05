import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class WebApiUrls {
  private _config: { [key: string]: string };
  constructor() {
    this.ImplementUrls();
  }

  ImplementUrls() {
    this._config = {
      FetchProductsGet: environment.baseApiUrl + "product/fetch-products-get",
      FetchProductsPost: environment.baseApiUrl + "product/fetch-products-post",
      
      GetProducts: environment.baseApiUrl + "product/getProducts",
      GetProductsShort: environment.baseApiUrl + "product/getShortProducts",
      GetSpecialProducts: environment.baseApiUrl + "product/getSpecialProducts",
      GetRelatedProducts: environment.baseApiUrl + "product/getRelatedProducts",
      GetProductDetails: environment.baseApiUrl + "product/", // then comes slug
      GetCartProducts: environment.baseApiUrl + "product/getCartProducts",
      GetFilterVariants: environment.baseApiUrl + "variants/get-filter-variants",
      UpdateProduct: environment.baseApiUrl + "product/update",
      DeleteProduct:environment.baseApiUrl + "product/delete",

      GetStoryPage: `${environment.baseApiUrl}StoryPage/get-story-page`,
      GetStoryBlock: `${environment.baseApiUrl}StoryPage/get-story-block`,
      
      CartAddProduct: environment.baseApiUrl + "cart/addCartItem",
      GetCart: environment.baseApiUrl + "cart/get-all-bycart",
      AddCartItem: environment.baseApiUrl + "cart/add-item",
      GetCartItems: environment.baseApiUrl + "cart/get-cart-items",

      AddCheckout: environment.baseApiUrl + "checkout/add-checkout",
      DeleteCheckout: environment.baseApiUrl + "checkout/delete-checkout",
      AddPreCheckout: environment.baseApiUrl + "checkout/add-precheckout",
      DeletePreCheckout: environment.baseApiUrl + "checkout/delete-precheckout",
      ApplyPromoCode: environment.baseApiUrl + "checkout/apply-promo",

      GetInvoice: environment.baseApiUrl + "order/get-invoice",
      AddOrder: environment.baseApiUrl + "order/add-order",
      AddFastOrder: environment.baseApiUrl + "order/add-fast-order",
      DeleteOrder: environment.baseApiUrl + "order/delete-order",
      UpdateIsPayed: environment.baseApiUrl + "order/update-ispayed",
      OrdersHistory: environment.baseApiUrl + "order/get-orders-history",
      UpdateOrderHistory: environment.baseApiUrl + "order/update-order-history",

      GetAllCategoriesWithSubs: environment.baseApiUrl + "categories/get-allCategoriesWithSubs",

      GetAllCategories: environment.baseApiUrl + "categories/get-categories",
      GetAllSubCategories:environment.baseApiUrl + "categories/get-subcategories",

      GetUsedCategories: environment.baseApiUrl + "categories/get-used-categories",
      GetUsedCategoriesWithSubs: environment.baseApiUrl + "categories/get-usedCategoriesWithSubs",
      GetAllByCategory: environment.baseApiUrl + "categories/get-all-by-category",

      GetAllOccasions: environment.baseApiUrl + "occasion/get-occasions",
      GetUsedOccasions: environment.baseApiUrl + "occasion/get-used-occasions",

      GetAllBrands: environment.baseApiUrl + "brands/get-brands",
      GetUsedBrands: environment.baseApiUrl + "brands/get-used-brands",
      GetAllSubBrands: environment.baseApiUrl + "brands/get-subBrands",
      GetUsedSubBrands: environment.baseApiUrl + "brands/get-used-subBrands",

      GetReview: environment.baseApiUrl + "review/get-review",
      GetAllReviews: environment.baseApiUrl + "review/get-all-reviews",
      GetReviewCount: environment.baseApiUrl + "review/get-review-count",
      GetReviewCards: environment.baseApiUrl + "review/get-review-cards",
      AddReview: environment.baseApiUrl + "review/add-review",
      SendToSupport: environment.baseApiUrl + "review/sent-message-to-support",
      DeleteReview: environment.baseApiUrl + "review/delete-review",
      
      DeleteCartItem: environment.baseApiUrl + "cart/delete-item",
      RegisterUser: environment.baseApiUrl + "Account/register",
      LoginUser: environment.baseApiUrl + "Account/login",
      LoginWithGoogle: environment.baseApiUrl + "Account/login2",
      LogoutUser: environment.baseApiUrl + "Account/logout",
      CheckAuth: environment.baseApiUrl + "Account/check-auth",
      GetCurrentUser: environment.baseApiUrl + "Account/get-current-user",
      ConfirmUser: environment.baseApiUrl + "Account/confirm-user",
      UpdateUserEmail: environment.baseApiUrl + "Account/update-user-email",
      UpdateUser: environment.baseApiUrl + "Account/update-user",
      CheckUser: environment.baseApiUrl + "Account/check-user-email",
      ChangePassword: environment.baseApiUrl + "Account/change-password",
      SetUserAffiliate: environment.baseApiUrl + "Account/set-user-affiliate",

      ResendVerification: environment.baseApiUrl + "Verification/resend-verification",

      PasswordChangeVerification: environment.baseApiUrl + "Verification/password-change-verification",
      ConfirmPasswordChangeVerification: environment.baseApiUrl + "Verification/confirm-password-change-verification",

      GetCountOfEmailVerifications: environment.baseApiUrl + "Verification/get-verifications-count",
      DeleteCountOfEmailVerifications: environment.baseApiUrl + "Verification/delete-verifications-by-email",

      CreatePayPalOrder: environment.baseApiUrl + "PayPal/create-paypal",
      CheckPayPalSuccess: environment.baseApiUrl + "PayPal/check-success",

      CreateStripeOrder: environment.baseApiUrl + "Stripe/create-stripe",
      CheckStripeSuccess: environment.baseApiUrl + "Stripe/check-success",

      CreateCodOrder: environment.baseApiUrl + "Cod/create-cod",
      CheckCodSuccess: environment.baseApiUrl + "Cod/check-success",
      GetSearchResults: environment.baseApiUrl + "Search/find",

      GetFavourites: environment.baseApiUrl + "Favourite/get-favourites",
      ActionFavourite: environment.baseApiUrl + "Favourite/action-favourite",
      
      // Affiliate
      GetAffiliateUser: environment.baseApiUrl + "Affiliate/GetAffiliateUser",
      GenerateRefCode: environment.baseApiUrl + "Affiliate/GenerateRefferalCode",
      AddPoints: environment.baseApiUrl + "Affiliate/add-points",
      AddEarnings: environment.baseApiUrl + "Affiliate/add-earnings",
      UpdateCommission: environment.baseApiUrl + "Affiliate/update-commission",
      ChangeStatus: environment.baseApiUrl + "Affiliate/change-status",
      IncrementReferralCount: environment.baseApiUrl + "Affiliate/increment-referral",
      AddPendingCash: environment.baseApiUrl + "Affiliate/add-pending-cash",
      TransferToApprovedCash: environment.baseApiUrl + "Affiliate/transfer-to-approved",
      TransferToPaidCash: environment.baseApiUrl + "Affiliate/transfer-to-paid",
      GetPerformance: environment.baseApiUrl + "Affiliate/get-performance",
      UpdatePaymentDetails: environment.baseApiUrl + "Affiliate/update-paymentdetails",

      // Admin
      RefreshPages: environment.baseApiUrl + "Database/refresh-pages",
      SendErrorMessage: environment.baseApiUrl + "Log/send-error-message",
    };
  }
  get setting(): { [key: string]: string } {
    return this._config;
  }
  get(key: any) {
    return this._config[key];
  }
}
