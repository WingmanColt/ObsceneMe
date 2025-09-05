import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { AccountService } from 'src/app/Services/Account/account.service';
import { AffiliateService } from 'src/app/Services/Account/affiliate.service';
import { AuthResponse} from 'src/app/shared/classes/account';
import { AffiliateUser } from 'src/app/shared/classes/affiliateUser';

@Component({
  selector: 'app-private-office-payments',
  templateUrl: './private-office-payments.component.html',
  styleUrl: './private-office-payments.component.scss'
})
export class PrivateOfficePaymentsComponent implements OnInit {
  env = environment;
  settings = this.env.pagesSettings.AccountSettings;

  paymentsForm: FormGroup | undefined;
  affiliateUser: AffiliateUser;
  isLoaded: boolean = false;
  outputMessage: string;
  
  constructor(    
    private fb: FormBuilder,
    private accountService: AccountService,
    private affiliateService: AffiliateService) {

      this.buildForm();
  }

  async ngOnInit(): Promise<void> {
    await this.fetchpaymentsForm();
  }
  

    async fetchpaymentsForm() {
      try {
        const x: AuthResponse = await this.accountService.getUserDetails();
  
        if (x.user) {
        this.paymentsForm?.patchValue({
          userId: x.user.id
        });     
         await this.fetchAffiliateUser(x.user.id)
          this.isLoaded = true;
        } 
  
      } catch (error) {
        this.isLoaded = false;
        console.error('An error occurred during resetBanTimer:', error);
      }
    }
  
  
  async fetchAffiliateUser(userId: string) {
  try {
    const affiliateUser = await this.affiliateService.getAffiliateUser(userId);
    if (affiliateUser) {
      this.affiliateUser = affiliateUser;
       this.paymentsForm?.patchValue({
          paymentEmail: affiliateUser.paymentEmail
      });   
    }
  } catch (error) {
    console.error('Failed to fetch affiliate user:', error);
  }
}
    private buildForm(): void {
      this.paymentsForm = this.fb.group({
        userId: [""],
        paymentEmail: ["", [Validators.required, Validators.email, this.asciiOnlyValidator]],
        paymentGateway:["", [Validators.required]]
      });
    }
  
    async onSubmit(): Promise<void> {
      try {
        const body = this.paymentsForm?.value;
        
        const response = await this.affiliateService.updatePaymentDetails(body);
  
        if (!response.success) 
          this.outputMessage = response.failureMessage;

      } catch (error) {
        console.error('An error occurred during password confirmation:', error);
      }
       
    }

    asciiOnlyValidator(control: FormControl) {
      const value = control.value;
      // The regular expression checks if all characters in the string are ASCII
      const isValid = /^[\x00-\x7F]*$/.test(value);
      // If the string is not valid, return an error object. Otherwise, return null.
      return isValid ? null : { nonAscii: true };
    }
}
