import { Component } from '@angular/core';
import { BreadcrumbObject } from 'src/app/shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {

  currBreadCrumb: BreadcrumbObject[] = [{ title: "Error 404", url: "/pages/404" }];

}
