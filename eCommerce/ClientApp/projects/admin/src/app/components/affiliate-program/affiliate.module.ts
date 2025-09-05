import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AffiliateRoutingModule } from './affiliate-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AffiliateUsersComponent } from './affiliate-users/affiliate-users.component';


@NgModule({

  declarations: [AffiliateUsersComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AffiliateRoutingModule,
    NgbModule,
    SharedModule
  ]
})
export class AffiliateModule { }
