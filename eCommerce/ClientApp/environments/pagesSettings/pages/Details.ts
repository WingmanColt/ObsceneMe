export const DetailsOptions = {
 // Shop Page
 stickyHeader: true,
 transparentHeader: false,
 invisibleBottomMenu: true,
 headerType: 0, // 0 show black header, 1 - show searchbar only, 2 - only breadcumb and header on bottom to top

 detailsPageTemplate: "Four", // One, Two, Four
 detailsPageBreadcrumb: true,
 aboutSection: "Tab Style-2", // Tab, Accordion, Tab Style-2, Storyteller
 swiperSection: "simple-swiper", // use thumbnail-swiper only with template: One

 detailsPageTemplateMobile: "Four", // One, Two, Three, Four
 detailsPageBreadcrumbMobile: true,
 aboutSectionMobile: "Tab", // Tab, Accordion, Storyteller
 swiperSectionMobile: "simple-swiper", // use app-like-swiper only with template: Two

 // When enabled images of variants will be in pagination of swiper, also users can slide through.
 // If it`s disabled users wouldn't be exposed to those images, they will be visible on click.
 swiperVariantsVisibleOnPagination: false, // not working as true !
 disableButtonsIfVariantIsNotSelected: false, // If it`s false alert modal will pop up.


 detailsInfoShow: true,
 fastOrderActive: true,
 shareOnSocialActive: false,
 descriptionActive: true,
 videoActive: false,
 usageActive: true,
 compositionActive: true,
 characteristicActive: true,

 quantityInsidePurchaseBtn: true,

 reviewsActive: true,
 reviewType: "Collapse", // Collapse, Modal
 reviewPicturesActive: true,
 reviewPicturesTemplate: 1,
 reviewCommentsActive: true,

 showRelatedProducts: true,
 relatedProductsCardTemplate: "clean", // basic, card, cardBlackBig, cardBlack, cardFull, minimal, clean

 sizeChartActive: true,
 sizeChartImage: "https://ik.imagekit.io/beautyflex/size-chart.webp?updatedAt=1684155751731",
 sizeChartTable: {
  tableActive: true,
  sizeChartHeading: [
   { Title: "US", colspan: "2" },
   { Title: "UK", colspan: "" },
   { Title: "Europe", colspan: "" },
  ],

  sizeChartBody: [
   { Text: "0", TextFull: "Extra Small", Text2: "4", Text3: "32", Text4: "", Text5: "" },
   { Text: "4", TextFull: "Small", Text2: "6", Text3: "34", Text4: "", Text5: "" },
   { Text: "6", TextFull: "Medium", Text2: "8", Text3: "36", Text4: "", Text5: "" },
   { Text: "8", TextFull: "Large", Text2: "10", Text3: "38", Text4: "", Text5: "" },
   { Text: "10", TextFull: "Extra Large", Text2: "12", Text3: "40", Text4: "", Text5: "" },
  ],
 },

};
