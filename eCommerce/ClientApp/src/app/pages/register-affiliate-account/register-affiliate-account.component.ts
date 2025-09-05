import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from 'src/app/Services/Account/account.service';
import { UserAccountModalService } from 'src/app/Services/Modal/userAccountModal.service';
import { AuthResponse, Register, VerificationResponse } from 'src/app/shared/classes/account';

@Component({
  selector: 'app-register-affiliate-account',
  templateUrl: './register-affiliate-account.component.html',
  styleUrls: ['./register-affiliate-account.component.scss']
})

export class RegisterAffiliateAccountComponent implements OnInit {

  registerForm: UntypedFormGroup;
  outputMessage: string;
  currentUser: AuthResponse | undefined;
  btnSubmitLoader: number = 0;

  private destroy$ = new Subject<void>();
  constructor(
    private fb: UntypedFormBuilder, 
    public accountService: AccountService,
    private modalService: UserAccountModalService) { 
      this.buildForm();
    }

  ngOnInit(): void {
    this.accountService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
       this.currentUser = user ?? undefined;

       if(this.currentUser != undefined) {
       if(this.currentUser.isAuthenticated && !this.currentUser.isEmailConfirmed)
        this.btnSubmitLoader = 5

       if(this.currentUser.isAuthenticated && this.currentUser.isEmailConfirmed && this.currentUser.user.isAffiliate)
        this.btnSubmitLoader = 6
      }
    });
  }
     
 ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  buildForm() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.asciiOnlyValidator]],
      firstname: ['', [Validators.required, Validators.minLength(5), this.asciiOnlyValidator]],
      lastname: ['', [Validators.required, Validators.minLength(5), this.asciiOnlyValidator]],
      phoneNumber: ["", [Validators.required, Validators.pattern("^[+0-9]+$")]],
      password: ["", [Validators.required, Validators.minLength(6), this.asciiOnlyValidator]],
      confirmPassword: ["", [Validators.required, Validators.minLength(6), this.asciiOnlyValidator]],
      })
  }


  async onSubmit(): Promise<void> {
    if (this.currentUser.isAuthenticated) {
      if (!this.currentUser.isEmailConfirmed) {
        this.btnSubmitLoader = 5
        await this.modalService.openModal('VerificationPage', true);
      } else {
        await this.setUserAffiliate();
      }
    } else {
      await this.onRegisterSubmit(this.registerForm.value);
    }
  }
  
    async onRegisterSubmit(body: Register): Promise<void> {
      try {
        this.btnSubmitLoader = 1;
        body.IsAffiliate = true;

        const response: VerificationResponse = await this.accountService.registerUser(body);
  
        if (response.token != null) {

          const loginResponse: AuthResponse = await this.accountService.loginUser(body);
  
          if (loginResponse.isAuthenticated){
            this.btnSubmitLoader = 2;

          }
  
        } else {
          this.btnSubmitLoader = 4;
          this.outputMessage = response.message;
        }
  
      } catch (error) {
        console.error('An error occurred during registration:', error);
        // Handle the error as needed, e.g., display an error message.
      }
    }
  async setUserAffiliate(): Promise<void> {
    try {
      this.btnSubmitLoader = 2;

      const response = await this.accountService.setUserAffiliate();
      if (response.success) {
        this.btnSubmitLoader = 3; 
      } else {
        this.btnSubmitLoader = 4; 
        this.outputMessage = response.failureMessage;
      }
    } catch (error) {
      console.error('An error occurred during password confirmation:', error);
    }
  }
  
 private asciiOnlyValidator(control: FormControl) {
    const value = control.value;
    // The regular expression checks if all characters in the string are ASCII
    const isValid = /^[\x00-\x7F]*$/.test(value);
    // If the string is not valid, return an error object. Otherwise, return null.
    return isValid ? null : { nonAscii: true };
  }

}
