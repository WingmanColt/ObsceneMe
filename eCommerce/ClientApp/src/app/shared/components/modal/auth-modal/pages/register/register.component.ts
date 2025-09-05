import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { environment } from 'environments/environment';
import { AccountService } from 'src/app/Services/Account/account.service';
import { SubscriptionTrackerService } from 'src/app/Services/Tracker/subscription-tracker.service';
import { AuthResponse, Register, VerificationResponse, ResendVerify } from 'src/app/shared/classes/account';

@Component({
  selector: 'app-modal-auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {
  componentName: string = "RegisterComponent";

  settings = environment;
  logoPath: string = this.settings.setting.logoPath;
  logoSizes: string[] = this.settings.setting.logoSizes;

  btnSubmitLoader: number = 0;
  outputMessage: string;

  registerForm: UntypedFormGroup | undefined;

  responseUser: string;
  responseOldToken: string;

  //@Input() pageName: string;
  @Output() pageChange = new EventEmitter<string>();
  @Output() UserData = new EventEmitter<ResendVerify>();
  @Output() CloseModal = new EventEmitter<void>();

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AccountService,
    private subTracker: SubscriptionTrackerService) {
    this.buildForms();
  }

  private buildForms(): void {
    this.registerForm = this.fb.group({
      firstname: ["", [Validators.required, Validators.minLength(3), this.asciiOnlyValidator]],
      lastname: ["", [Validators.required, Validators.minLength(3), this.asciiOnlyValidator]],
      email: ["", [Validators.required, Validators.email, this.asciiOnlyValidator]],
      password: ["", [Validators.required, Validators.minLength(6), this.asciiOnlyValidator]],
      confirmPassword: ["", [Validators.required, Validators.minLength(6), this.asciiOnlyValidator]],
      confirmPrivacy: false
    });
  }

  async onRegisterSubmit(body: Register): Promise<void> {
    try {
      this.btnSubmitLoader = 1;
      
      body.IsAffiliate = false;
      const response: VerificationResponse = await this.authService.registerUser(body);

      if (response.token != null) {
        const loginResponse: AuthResponse = await this.authService.loginUser(body);

        if (loginResponse.isAuthenticated)
          this.btnSubmitLoader = 2;

      } else {
        this.btnSubmitLoader = 4;
        this.outputMessage = response.message;
      }

    } catch (error) {
      console.error('An error occurred during registration:', error);
      // Handle the error as needed, e.g., display an error message.
    }
  }
  switchPage(page: string) {
    // this.pageName = page;
    this.pageChange.emit(page);

    if (this.responseUser?.length > 0 && this.responseOldToken?.length > 0)
      this.UserData.emit(new ResendVerify(this.responseUser, this.responseOldToken));
  }

  asciiOnlyValidator(control: FormControl) {
    const value = control.value;
    // The regular expression checks if all characters in the string are ASCII
    const isValid = /^[\x00-\x7F]*$/.test(value);
    // If the string is not valid, return an error object. Otherwise, return null.
    return isValid ? null : { nonAscii: true };
  }

  ngOnDestroy(): void {
    this.subTracker.releaseAllForComponent(this.componentName);
  }

    getLogoUrl(sizeIndex: number = 0): string {
    const logo = this.logoSizes[sizeIndex] ?? '';
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    return this.logoPath + logo;
  }
}
