import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeatherIconsComponent } from './components/feather-icons/feather-icons.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToggleFullscreenDirective } from "./directives/fullscreen.directive";
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';
import { NavService } from './service/nav.service';

import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { RightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import { TableService } from './service/table.service';
import { NgbdSortableHeader } from './directives/NgbdSortableHeader';
import { MultiCheckboxDropdownComponent } from '../components/multi-checkbox-dropdown/multi-checkbox-dropdown.component';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    ToggleFullscreenDirective,
    FeatherIconsComponent,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
    ContentLayoutComponent,
    BreadcrumbComponent,
    RightSidebarComponent,
    NgbdSortableHeader,
    DropdownComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  providers: [NavService, TableService],
  exports: [FeatherIconsComponent, ToggleFullscreenDirective, NgbdSortableHeader, DropdownComponent, TranslateModule]
})
export class SharedModule { }
