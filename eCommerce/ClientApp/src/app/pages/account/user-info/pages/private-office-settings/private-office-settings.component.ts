import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { AccountService } from 'src/app/Services/Account/account.service';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { UserAccountModalService } from 'src/app/Services/Modal/userAccountModal.service';
import { AuthResponse, User } from 'src/app/shared/classes/account';
import { Country } from 'src/app/shared/classes/country';
import { DropdownItem } from 'src/app/shared/classes/dropdown';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';

@Component({
  selector: 'app-private-office-settings',
  templateUrl: './private-office-settings.component.html',
  styleUrl: './private-office-settings.component.scss'
})
export class PrivateOfficeSettingsComponent implements OnInit {
  
  env = environment;
  settings = this.env.pagesSettings.AccountSettings;
  isMobile: boolean; 
  
  countries: Array<String> = this.env.countriesSettings.shippingAvaliableTo;
  avaliableCountries: Country[] = [];
  selectedCountryLabel: string = '';
  
  user: User;
  userDetailsForm: FormGroup | undefined;
  isLoaded: boolean = false;
  outputMessages: string[] = [];
  btnSubmitLoader: number = 0;

  constructor(    
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,  // inject this
    private accountModalService: UserAccountModalService,
    private accountService: AccountService,
    private deviceDetector: BreakpointDetectorService) {

      this.buildForm();
  }

  async ngOnInit(): Promise<void> {
    this.isMobile = this.deviceDetector.isDevice("Mobile");
    this.generateCountries();

    await this.fetchUserDetailsForm();
   // await this.fetchOrdersHistory('all');
  }

    async fetchUserDetailsForm() {
      try {
        const x: AuthResponse = await this.accountService.getUserDetails();
  
        if (x.user) {
          this.user = x.user;
          this.userDetailsForm?.patchValue(x.user);        
          this.selectedCountryLabel = x.user.country;  // <--- set this    
          this.isLoaded = true;
          this.cd.detectChanges(); // update UI after patch
        } 
  
      } catch (error) {
        this.isLoaded = false;
        console.error('An error occurred during resetBanTimer:', error);
      }
    }
  
    private generateCountries(): void {
      this.countries.forEach((item) => {
        switch (item) {
          case "europeCountries":
            this.avaliableCountries = this.avaliableCountries?.concat(this.env.countriesSettings.europeCountries);
            break;
        }
      });
  
    }
    private buildForm(): void {
      this.userDetailsForm = this.fb.group({
          firstName: ["", Validators.required],
          lastName: ["", Validators.required],
          fullName: ["", [Validators.required, Validators.minLength(5), this.asciiOnlyValidator]],
          phoneNumber: ["", [Validators.required, Validators.pattern("^[+0-9]+$")]],
          email: ["", [Validators.required, Validators.email, this.asciiOnlyValidator]],
          address: ["", [Validators.required, Validators.maxLength(50), this.asciiOnlyValidator]],
          country: ["", Validators.required],
          city: ["", [Validators.required, this.asciiOnlyValidator]],
          state: ["", [Validators.required, this.asciiOnlyValidator]],
          postalCode: ["", Validators.required],
          isAffiliate: [false],
          emailNotifyEnable: [false],
          signInSocialEnable: [false]
      });
    }


  async onSubmit(): Promise<void> {
  this.btnSubmitLoader = 1;
  this.outputMessages = [];
  const formValue = this.userDetailsForm.value;

  const user = new User(
    this.user.id,
    formValue.email,
    this.user.emailConfirmed,
    formValue.fullName,
    formValue.firstName,
    formValue.lastName,
    formValue.isAffiliate,
    formValue.emailNotifyEnable,
    formValue.signInSocialEnable,
    formValue.country,
    formValue.city,
    formValue.address,
    formValue.postalCode,
    formValue.state,
    formValue.phoneNumber
  );
  try {
    const response: OperationResult = await this.accountService.updateUserDetails(user);

    if (!response.success) {
      this.btnSubmitLoader = 2;

      if (response.failureMessages && response.failureMessages.length > 0) {
        this.outputMessages = response.failureMessages;
      } else if (response.failureMessage) {
        this.outputMessages = [response.failureMessage];
      } else {
        this.outputMessages = ["Unknown error occurred."];
      }
    } else {
      this.btnSubmitLoader = 3;
    }
    this.cd.detectChanges();  // force update UI
  } catch (error) {
    this.btnSubmitLoader = 2;
    console.error('An error occurred during password confirmation:', error);
    this.outputMessages = ["An unexpected error occurred."];
    this.cd.detectChanges();
  }
}

    openChangePassword(): void {
        this.accountModalService.openModal('ForgetPasswordPage', false);
    }
  
  onCountrySelect(label: string) {
    this.userDetailsForm.get('country')?.setValue(label); // keep in sync
  }

    asciiOnlyValidator(control: FormControl) {
      const value = control.value;
      // The regular expression checks if all characters in the string are ASCII
      const isValid = /^[\x00-\x7F]*$/.test(value);
      // If the string is not valid, return an error object. Otherwise, return null.
      return isValid ? null : { nonAscii: true };
    }
}
