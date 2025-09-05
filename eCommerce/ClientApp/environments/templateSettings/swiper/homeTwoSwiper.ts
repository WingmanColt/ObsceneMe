export const homeTwoSwiperOptions = {
 swiperBigImageRefresh: true,
 activeShadow: "0 0px 12px 0px #DA6D08", // none | horizontal-offset vertical-offset blur spread color
 navigationDevices: "desktop-only", // mobile-only

 SwiperArray: [
  {
   id: 0, // Must start with 0, every new slide increase by 1
   imageBottomBorderRadius: "2px", // empty for none
   videoSrc: 'assets/videos/slide1.mp4',
   videoWebmSrc: 'assets/videos/slide1.webm',
   muted: true,
   isActive: false,
   logo: "assets/images/obscene.me/logos/logo-small.webp", 
   logoWhite: "assets/images/obscene.me/logos/logo-white.webp",
   title: "",
   titleMobile:"",
   titleColor: "#fff",
   desc: "",
   descMobile:"",
   descColor: "#fff",

   btnDevice:"", // Mobile, Desktop, All
   btnText: "",
   btnTextColor: "#cfd4da",
   btnLink: "",
   btnColor: "#000",
   btnLinkNewBlank: false,

   btn2Device:"Mobile", // Mobile, Desktop, All
   btn2Text: "",
   btn2TextColor: "",
   btn2Link: "",
   btn2Color: "",
   btn2LinkNewBlank: true,

   // Theme: 'One'
   titleAlign: "left",
   titleAlignMobile: "center",
   buttonsAlign: "left",
   buttonsAlignMobile: "center", // left, right, center
   buttonsDirection: "row",
   buttonsDirectionMobile: "column", // row, column
   textReverse: false,
  }
 ]
};
