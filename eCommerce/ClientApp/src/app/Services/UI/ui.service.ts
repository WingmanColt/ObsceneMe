import { Injectable } from "@angular/core";
import AsyncLocalStorage from "@createnextapp/async-local-storage";

@Injectable({
 providedIn: "root",
})
export class UIService {
 constructor() {}

 public async isDarkMode(): Promise<boolean> {
  const theme = await AsyncLocalStorage.getItem("dark-theme");
  return theme ? true : false;
 }

 public async switchDarkMode(): Promise<boolean> {
  const theme = await AsyncLocalStorage.getItem("dark-theme");
  if (!theme) {
   await AsyncLocalStorage.setItem("dark-theme", true);
   document.body.classList.add("dark");
   return true;
  } else {
   await AsyncLocalStorage.removeItem("dark-theme");
   document.body.classList.remove("dark");
   return false;
  }
 }
}
