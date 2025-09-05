import { Component} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { ReviewsService } from '../../Services/Review/reviews.service';
import { Review } from '../../shared/classes/review';
import { BreadcrumbObject } from 'src/app/shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {

  settings = environment;
  btnSubmitLoader: number = 0;

  currBreadCrumb: BreadcrumbObject[] = [{ title: "Contact", url: "/pages/contact" }];
  messageForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    public reviewService: ReviewsService,
    private router: Router) { 

      this.buildForm(); 
    }



  buildForm() {
    this.messageForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      lastname: ['', [Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+[a-zA-Z]$')]],
      email: ['', [Validators.required, Validators.email]],
      about: [''],
      sendToSupport: true
    })
  }

  async onSubmit(body: Review) {
    console.log(body)
    try {
      this.btnSubmitLoader = 1;
      const oResult = await this.reviewService.SendToSupport(body);

      if (oResult.success) {
        this.btnSubmitLoader = 2;
      }
    } catch (error) {
      // Handle errors as needed
      console.error('Error submitting review:', error);
    }
  }

}
