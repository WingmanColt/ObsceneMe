import { Injectable } from "@angular/core";
import { environment } from "environments/environment";

@Injectable({
 providedIn: "root",
})
export class ShippingApiUrls {
 private _config: { [key: string]: string };

 private creditials: string[][] = [
  ["iasp-dev", "1Asp-dev"], // econt credits
  ["", ""], // speedy credits
 ];

 private isProduction = environment.production;
 private econtWeb: string = this.isProduction ? "https://api.econt.com/" : "https://api.econt.com/";

 constructor() {
  this._config = {
   calculateEcont: this.econtWeb + "createAWB",
  };
 }
 get setting(): { [key: string]: string } {
  return this._config;
 }
 get(key: any) {
  return this._config[key];
 }
}
