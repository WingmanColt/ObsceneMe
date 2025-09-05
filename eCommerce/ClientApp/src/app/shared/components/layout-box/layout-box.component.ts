import { Component, OnInit } from "@angular/core";
import { environment } from "environments/environment";
import { UIService } from "src/app/Services/UI/ui.service";

@Component({
 selector: "app-layout-box",
 templateUrl: "./layout-box.component.html",
 styleUrls: ["./layout-box.component.scss"],
})
export class LayoutBoxComponent implements OnInit {
 public layoutsidebar: boolean = false;
 public activeItem: string;
 enable = environment.homeSettings.darkMode;

 constructor(private _uiService: UIService) {}

 ngOnInit(): void {
  this._uiService
   .isDarkMode()
   .then((x) => {
    if (x === true) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
   })
   .catch((error) => {
    console.error("Error checking dark mode:", error);
   });
 }

 // Is active
 isActive(menuItem) {
  return this.activeItem === menuItem;
 }

 // Sidebar Toggle
 layoutSidebarToggle() {
  this.layoutsidebar = !this.layoutsidebar;
 }

 // collapse
 opensettingcontent(val) {
  if (this.activeItem === val) {
   this.activeItem = "";
  } else {
   this.activeItem = val;
  }
 }

 // Layout Type
 customizeLayoutType(val) {
  if (val == "rtl") {
   document.body.classList.remove("ltr");
   document.body.classList.add("rtl");
  } else {
   document.body.classList.remove("rtl");
   document.body.classList.add("ltr");
  }
 }

 // Set Theme color
 customizeThemeColor(event) {
  document.documentElement.style.setProperty("--theme-deafult", event.target.value);
 }
 async customizeLayoutDark() {
  const isDark = await this._uiService.switchDarkMode();
  if (isDark) {
   document.body.classList.add("dark");
  } else {
   document.body.classList.remove("dark");
  }
 }
}
