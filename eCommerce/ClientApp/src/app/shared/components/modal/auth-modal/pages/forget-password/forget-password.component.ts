import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { AccountService } from 'src/app/Services/Account/account.service';
import { ChangePasswordRequest, PasswordVerificationRequest, User } from 'src/app/shared/classes/account';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit, OnDestroy {
  componentName: string = "ForgetPasswordComponent";

  settings = environment;
  logoPath: string = this.settings.setting.logoPath;
  logoSizes: string[] = this.settings.setting.logoSizes;

  avatarColors: string;
  btnSubmitLoader: boolean = false;

  isEditing: boolean = false;
  isPasswordChanged: boolean = false;
  onUserSettingsPage: boolean = false;

  forgetForm: UntypedFormGroup | undefined;
  verificationCode: string;
  outputMessage: string;

  canUpdatePassword: boolean;
  canResendPassword: boolean;

  @Input() userData: User | undefined;
  @Input() withVerification: boolean = false;

  @Output() pageChange = new EventEmitter<string>();
  @Output() CloseModal = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService) {

    this.createForm();
  }

  async ngOnInit(): Promise<void> {
    if(this.userData === undefined) {
    this.userData = this.accountService.currentUser.user;
    this.onUserSettingsPage = true;
    } 
    else this.onUserSettingsPage = false;
  
    this.generateColors();
  }



  generateColors() {
    this.avatarColors = "rgb(" +
      Math.floor(Math.random() * 200) + "," +
      Math.floor(Math.random() * 200) + "," +
      Math.floor(Math.random() * 200) + ")";
  }
  createForm() {
    this.forgetForm = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6), this.asciiOnlyValidator]],
      confirmPassword: ["", [Validators.required, Validators.minLength(6), this.asciiOnlyValidator]]
    });
  }

  async onConfirmSubmit(): Promise<void> {
    try {
      const passwordValue = this.forgetForm.get('password').value;
      const confirmPasswordValue = this.forgetForm.get('confirmPassword').value;
      const createdOn = this.getCurrentDateTimeString();

      const response =  this.withVerification ? await this.accountService.confirmPasswordChangeVerification(new PasswordVerificationRequest(this.userData.email, this.verificationCode, createdOn, passwordValue, confirmPasswordValue)) : 
        await this.accountService.changePassword(new ChangePasswordRequest(passwordValue, confirmPasswordValue, createdOn));

      if (response.success) {
        this.isPasswordChanged = true;

        if(!this.onUserSettingsPage)
        setTimeout(() => { this.switchPage('LoginPage'); }, 3000);
      
      } else {
        this.outputMessage = response.failureMessage;
      }
    } catch (error) {
      console.error('An error occurred during password confirmation:', error);
      // Handle the error as needed, e.g., display an error message.
    }
  }

  /*
  async submitEditedEmail(): Promise<void> {
    try {
      const x: OperationResult = await this.accountService.updateUserEmail(new VerificationUser(this.userData.email)
      );

      if (x.success) {
        this.isEditing = !this.isEditing;
        this.outputMessage = '';
      } else {
        this.outputMessage = x.failureMessage;
      }
    } catch (error) {
      console.error('An error occurred during resetBanTimer', error, this.componentName);
    }
  }
*/
  ngOnDestroy(): void {
  
  }

  private asciiOnlyValidator(control: FormControl) {
    const value = control.value;
    const isValid = /^[\x00-\x7F]*$/.test(value);
    return isValid ? null : { nonAscii: true };
  }

  private getCurrentDateTimeString = (): string => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Note: Months are zero-based
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    return formattedDate;
  };

  switchPage(page: string) {
    this.pageChange.emit(page);
  }
  setVerifyCode($event: string) {
    this.verificationCode = $event;
  }
  setOutputMessage($event: string) {
    this.outputMessage = $event;
  }
  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }
  
  getLogoUrl(sizeIndex: number = 0): string {
    const logo = this.logoSizes[sizeIndex] ?? '';
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    return this.logoPath + logo;
  }
}
