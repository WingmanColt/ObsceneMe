import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { AccountService } from 'src/app/Services/Account/account.service';
import { SubscriptionTrackerService } from 'src/app/Services/Tracker/subscription-tracker.service';
import { AuthResponse, GoogleAuthDto, Login, User, VerificationUser } from 'src/app/shared/classes/account';

declare const google: any;
@Component({
  selector: 'app-modal-auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  componentName: string = "LoginComponent";
  clientId = '176691254479-j1ivs4prjp19vsgmu0a06lavmc1thvkp.apps.googleusercontent.com';
  
  settings = environment;
  logoPath: string = this.settings.setting.logoPath;
  logoSizes: string[] = this.settings.setting.logoSizes;

  btnSubmitLoader: boolean = false;
  emailEntered: boolean = false;

  user: User;
  outputMessage: string;

  loginForm: FormGroup;

  @Output() UserData = new EventEmitter<User>();
  @Output() pageChange = new EventEmitter<string>();
  @Output() CloseModal = new EventEmitter<void>();

  constructor(
    private ngZone: NgZone,
    private fb: FormBuilder,
    private authService: AccountService,
    private subTracker: SubscriptionTrackerService
  ) {
    this.buildForms();
  }
  ngOnInit() {
        this.loadGoogleScript().then(() => {
      this.initializeGoogleSignIn();
    });
  }

   loadGoogleScript(): Promise<void> {
    return new Promise((resolve) => {
      if (document.getElementById('google-client-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-client-script';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => this.handleCredentialResponse(response),
      ux_mode: "popup", // important for Safari!
      auto_select: false, // Optional: show account chooser dialog
      cancel_on_tap_outside: false,
    });

    google.accounts.id.renderButton(
      document.getElementById('googleSignInDiv'),
      { theme: 'outline', size: 'large' }  // customization of button
    );

    // Optional: prompt One Tap
    // google.accounts.id.prompt();
  }

  handleCredentialResponse(response: any) {
    // response.credential contains the JWT ID token from Google
    this.ngZone.run(async () => {
      const body: GoogleAuthDto = { idToken: response.credential };
      await this.authService.loginWithGoogle(body)
        .then(res => {
          this.switchPage('ResponsePage')
        })
        .catch(err => {
          console.error('HTTP or parsing error', err);
          if (err instanceof SyntaxError) {
            console.error('Likely JSON parse issue:', err.message);
          }
        });

    });
  }

  private buildForms(): void {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email, this.asciiOnlyValidator]],
      password: ["", [Validators.required, Validators.minLength(6), this.asciiOnlyValidator]],
    });
  }

  onEmailContinue(): void {
    if (this.loginForm?.controls.email.valid) {
      this.btnSubmitLoader = true;
      this.checkEmail();
      // Optionally, you can replace the signup logic here if needed.
    }
  }

  async checkEmail(): Promise<void> {
    try {
      const email = this.loginForm?.controls.email.value;
      const res: AuthResponse = await this.authService.checkUserEmail(new VerificationUser(email));

      if (res.user) {
        this.btnSubmitLoader = false;
        this.emailEntered = true;
        this.outputMessage = '';

        this.UserData.emit(res.user);
      } else {
        this.btnSubmitLoader = false;
        this.outputMessage = res.message;
      }
    } catch (error) {
      // Handle errors
      console.error('Error checking email:', error);
    }
  }

  async onLoginSubmit(body: Login): Promise<void> {
    try {
      this.btnSubmitLoader = true;
      const response: AuthResponse = await this.authService.loginUser(body);

      this.btnSubmitLoader = false;
      this.outputMessage = response.message;

      if (response.isAuthenticated) {
        this.user = response.user;

        this.UserData.emit(this.user);

        if(this.user.emailConfirmed)
        this.CloseModal.emit();
        else 
        this.switchPage('VerificationPage')
      }
    } catch (error) {
      // Handle errors
      console.error('Error during login:', error);
    }
  }

  
  switchPage(page: string) {
    this.pageChange.emit(page);
  }

  onEnterKey(event: KeyboardEvent) {
    // Prevent form submission on Enter key press
    event.preventDefault();
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