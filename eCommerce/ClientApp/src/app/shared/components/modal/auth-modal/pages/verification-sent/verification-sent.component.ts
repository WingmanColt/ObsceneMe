import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from 'src/app/Services/Account/account.service';
import { SubscriptionTrackerService } from 'src/app/Services/Tracker/subscription-tracker.service';
import { VerificationService } from 'src/app/Services/Verification/verification.service';
import { TimerService } from 'src/app/Services/timer.service';
import { AuthResponse, User, VerificationRequest, VerificationResponse, VerificationUser } from 'src/app/shared/classes/account';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';


@Component({
  selector: 'app-verification-sent',
  templateUrl: './verification-sent.component.html',
  styleUrls: ['./verification-sent.component.scss']
})
export class VerificationSentComponent implements OnInit, OnDestroy {
  componentName: string = "VerificationSentComponent";
  settings = environment;
  logoPath: string = this.settings.setting.logoPath;
  logoSizes: string[] = this.settings.setting.logoSizes;

  verificationForm: FormGroup;
  outputMessage: string;

  isEditing: boolean = false;
  canConfirmUser: boolean = false;

  verificationDigits: number = 7;
  resendAttempts: number = 0; // Track the number of resend attempts
  resendCooldown: number = 0; // Cooldown time after first 3 attempts (in seconds)
  isResendClicked: boolean = false;

  verificationCode: string = ' ';
  btnSubmitLoader: number = 0;
  avatarColors: string;

  @Input() userData: User;
  @Output() pageChange = new EventEmitter<string>();
  @Output() CloseModal = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>(); 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService,
    public timerService: TimerService,
    private verificationService: VerificationService) {

  }


  async ngOnInit(): Promise<void> {
    this.InitComponent();
  }


  private InitComponent(): void {
    this.verificationForm = this.fb.group(
      Object.fromEntries(Array.from({ length: this.verificationDigits }, (_, i) => [`codeInput${i}`, ['', Validators.required]]))
    );

    this.accountService.currentUser$
      .pipe(takeUntil(this.destroy$))  // Automatically unsubscribed when destroy$ emits
      .subscribe((response: AuthResponse) => {
        if (response?.user) {
          this.userData = { ...response.user, token: response.token };
        }
      });

    /*  this.verificationService.getVerificationsByEmailCount(new VerificationUser(this.userData.email))
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (n: number) => {
          this.verificationsCount = n;
        });*/
  
        this.verificationForm.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.verificationCode = Object.values(this.verificationForm.value).join('');
          this.canConfirmUser = this.verificationCode.length === this.verificationDigits;
        });

      this.avatarColors = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`;
      
      this.timerService.executeTimerSubscription();
  }
  
 async confirmUser(): Promise<void> {
    if (!this.canConfirmUser) return;

    try {
      this.btnSubmitLoader = 1;
      const request = new VerificationRequest(this.userData.email, this.verificationCode, this.getCurrentDateTimeString());
      const result = await this.accountService.confirmUser(request);

      this.btnSubmitLoader = result.success ? 2 : 0;
      this.outputMessage = result.success ? '' : 'Invalid or expired verification code.';

      if (result.success) {
        setTimeout(() => this.CloseModal.emit(true), 2000);
        this.router.navigate(["/pages/account/user-info"]);
        
      } else {
        this.clearAllInputValues();
      }
    } catch (error) {
      this.clearAllInputValues();
      console.error('Error confirming user:', error);
    }
  }

  async resendCode(): Promise<void> {
    if (this.resendAttempts >= 3) {
      // If resend attempts are 3 or more, apply the cooldown of 240 seconds
      this.resendCooldown = 240;
      this.resendAttempts = 0; // Reset resend attempts after the cooldown period
      this.timerService.resetTimer(this.resendCooldown); // Reset the timer
      this.timerService.startTimer(this.resendCooldown); // Start the 240 seconds cooldown timer
      return;
    }

    try {
      this.isResendClicked = true;
      this.clearAllInputValues();

      const result: VerificationResponse = await this.accountService.resendVerification();
      if (result) {
        this.outputMessage = '';

        // Start the timer for the resend button (60 seconds cooldown)
        this.resendAttempts++; // Increment resend attempt counter
        this.timerService.resetTimer(60); // Reset the timer
        this.timerService.startTimer(60); // Start the 60 seconds cooldown timer
      }
    } catch (error) {
      console.error('Error resending code:', error);
    } finally {
      this.isResendClicked = false;
    }
  }


  /*async resetBanTimer(): Promise<void> {
    try {
      const result: OperationResult = await this.verificationService.deleteVerificationsByEmailCount(new VerificationUser(this.userData.email));

      if (result.success) {
        this.verificationsCount = 0;
        this.isResendClicked = false;
      //  this.verificationService.updateVerificationsByEmailCount(this.verificationsCount);
      } else {
        this.outputMessage = 'An error occurred while resetting the ban timer.';
      }
    } catch (error) {
      console.error('Error resetting ban timer:', error);
    }
  }*/

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }
  async submitEditedEmail(): Promise<void> {
    try {
      const result: OperationResult = await this.accountService.updateUserEmail(new VerificationUser(this.userData.email));

      if (result.success) {
        this.isEditing = false;
        this.outputMessage = '';
      } else {
        this.outputMessage = result.failureMessage;
      }
    } catch (error) {
      console.error('Error updating email:', error);
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();  // Emit to trigger unsubscriptions
    this.destroy$.complete();  // Complete the Subject

    this.timerService.stopTimer();
  }

  private getCurrentDateTimeString(): string {
    const currentDate = new Date();
    return `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  }

  onInput(event: any, currentIndex: number): void {
    const nextInput = document.getElementsByName(`codeInput${currentIndex + 1}`)[0] as HTMLInputElement;
    if (event.target.value && nextInput) {
      nextInput.focus();
    }
  }
  onPaste(event: ClipboardEvent): void {
    const pasteData = event.clipboardData?.getData('text')?.trim();
  
    if (pasteData) {
      // Remove spaces from the pasted data
      const cleanedData = pasteData.replace(/\s+/g, '');
  
      // Ensure we have the correct length of data (should be 7 digits in your case)
      if (cleanedData.length === this.verificationDigits) {
        const controls = this.verificationForm.controls;
        const controlKeys = Object.keys(controls);
  
        // Clear all input fields before pasting
        this.clearAllInputValues();
  
        // Paste the cleaned data to the corresponding inputs
        for (let j = 0; j < cleanedData.length && j < controlKeys.length; j++) {
          controls[controlKeys[j]].setValue(cleanedData[j]);
        }
      } else {
        console.error('Invalid verification code length:', cleanedData.length);
      }
    }
  
    // Prevent the default paste behavior (optional)
    event.preventDefault();
  }
  
  
  allInputsFilled(): boolean {
    return Object.values(this.verificationForm.value).every(val => val !== '');
  }
  clearAllInputValues(): void {
    const formControls = Object.keys(this.verificationForm.controls);
    
    formControls.forEach(control => {
      const abstractControl = this.verificationForm.get(control);
      if (abstractControl instanceof AbstractControl) {
        abstractControl.setValue(''); // Clear the value of the control
        abstractControl.markAsUntouched(); // Mark the control as untouched
        abstractControl.markAsPristine(); // Mark the control as pristine
      }
    });
  
    this.verificationCode = '';
  }
  
  onKeydown(event: KeyboardEvent): void {
    // Check if the pressed key is backspace (keyCode 8)
    if (event.key === 'Backspace') {
      this.clearAllInputValues();
      // Reset focus to the first input field
      const firstInputField = document.getElementsByName('codeInput0')[0] as HTMLInputElement;
      if (firstInputField) {
        firstInputField.focus();
      }
    }
  }
  
  switchPage($event) {
    this.pageChange.emit($event.page);
  }

  controls(): string[] {
    return Object.keys(this.verificationForm.controls);
  }
  
  trackByIndex(index: number, item: any): number {
    return index;
  }

  getLogoUrl(sizeIndex: number = 0): string {
    const logo = this.logoSizes[sizeIndex] ?? '';
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    return this.logoPath + logo;
  }
  
}
