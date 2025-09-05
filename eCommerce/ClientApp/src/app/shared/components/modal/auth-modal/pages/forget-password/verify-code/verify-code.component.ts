import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AccountService } from 'src/app/Services/Account/account.service';
import { SubscriptionTrackerService } from 'src/app/Services/Tracker/subscription-tracker.service';
import { VerificationService } from 'src/app/Services/Verification/verification.service';
import { TimerService } from 'src/app/Services/timer.service';
import { VerificationUser } from 'src/app/shared/classes/account';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss'
})

export class VerifyCodeComponent implements OnInit, OnDestroy {
  componentName: string = "VerifyCodeComponent";
 
  verificationForm: FormGroup;
  verificationsCount: number;
  verificationCode: string = ' ';
  outputMessage: string;

  isResendClicked: boolean = false;

  canUpdatePassword: boolean;
  canResendPassword: boolean;
  
  @Input() email: string;
  @Output() VerificationCode = new EventEmitter<string>();
  @Output() OutputMessage = new EventEmitter<string>();
  
  @Output() CanUpdatePassword = new EventEmitter<boolean>();
  @Output() CanResendPassword = new EventEmitter<boolean>();
  
  constructor(
    public timerService: TimerService, 
    private fb: FormBuilder,
    private accountService: AccountService,
    private verificationService: VerificationService,
    private subTracker: SubscriptionTrackerService){ 

     this.createForm();
    }

  async ngOnInit(): Promise<void> {
    this.subscribeToChanges();
    await this.initCounter();

  }

    async initCounter(): Promise<void> {
    const subCounter = this.verificationService.getVerificationsByEmailCount(new VerificationUser(this.email))
      .subscribe(async (n: number) => {
        this.verificationsCount = n;
      });

    this.subTracker.track({
      subscription: subCounter,
      name: "subCounter",
      fileName: this.componentName,
    });

    this.timerService.executeTimerSubscription();
  }
  
    createForm() {
    this.verificationForm = this.fb.group({
      codeInput0: ['', Validators.required],
      codeInput1: ['', Validators.required],
      codeInput2: ['', Validators.required],
      codeInput3: ['', Validators.required],
      codeInput4: ['', Validators.required],
      codeInput5: ['', Validators.required],
      codeInput6: ['', Validators.required],
    });
  }

  // CODE
  subscribeToChanges() {
    const subChanges = this.verificationForm.valueChanges.subscribe(() => {
      if (this.allInputsFilled()) {
        // Concatenate the values from individual controls to get the complete verification code
        const userInput = Object.keys(this.verificationForm.controls)
          .map(control => this.verificationForm.get(control).value)
          .join(' ').toString();

        this.VerifyCode(userInput);
        this.CanUpdate(true);
        } else
         this.CanUpdate(false);
    });

    this.subTracker.track({
      subscription: subChanges,
      name: "subChanges",
      fileName: this.componentName,
    });
  }

  async resendCode(): Promise<void> {
    if (this.verificationsCount == undefined) {
      return;
    }

    if (this.verificationsCount < 5) {
      this.isResendClicked = true;
      this.clearAllInputValues();

      try {
        const x: OperationResult = await this.accountService.passwordChangeVerification(new VerificationUser(this.email));

        if (x.success) {
          this.CanResend(true);
          const clean = Object.values(this.verificationForm.controls)
            .map(control => control.value)
            .join(' ');

          this.VerifyCode(clean);
          this.OutMessage('')

          this.timerService.setResendCount(this.timerService.getResendCount() + 1);

          this.timerService.resetTimer(60);
          this.timerService.startTimer(60);
          this.isResendClicked = false;
        }
      } catch (error) {
        console.error('An error occurred during password change verification:', error);
      }
    } else {
      this.timerService.resetTimer(240);
      this.timerService.startTimer(240);
      this.OutMessage('You exceeded the verification send limit.')
      setTimeout(() => { this.resetBanTimer(); }, 240000);
    }
  }


  async resetBanTimer(): Promise<void> {
    this.OutMessage('')

    try {
      const x: OperationResult = await this.verificationService.deleteVerificationsByEmailCount(new VerificationUser(this.email));

      if (x.success) {
        this.verificationsCount = 0;
        this.isResendClicked = false;

        this.verificationService.updateVerificationsByEmailCount(this.verificationsCount);
      } else {
        this.OutMessage('An error occured during resseting ban time.')
      }

    } catch (error) {
      console.error('An error occurred during resetBanTimer:', error);
      // Handle the error as needed, e.g., display an error message.
    }
  }
  
  onInput(event: any, currentIndex: number): void {
    const inputValue = event.target.value;
    const nextIndex = currentIndex + 1;

    if (inputValue && nextIndex < this.controls().length) {
      const nextControl = this.verificationForm.get(this.controls()[nextIndex]);
      if (nextControl) {
        // Set focus on the next input field
        nextControl.markAsTouched(); // Trigger any validation messages if needed
        nextControl.markAsDirty(); // Mark the control as dirty to trigger any dirty checks
        nextControl.updateValueAndValidity(); // Update value and trigger validation

        const nextInput = document.getElementsByName(`codeInput${nextIndex}`)[0];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  }

  allInputsFilled(): boolean {
    const formControls = Object.keys(this.verificationForm.controls);

    return formControls.every(control => {
      const abstractControl = this.verificationForm.get(control);
      return abstractControl instanceof AbstractControl && abstractControl.value !== '';
    });
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
  controls() {
    return Object.keys(this.verificationForm.controls);
  }

  OutMessage(message: string) {
    this.outputMessage = message;
    this.OutputMessage.emit(message);
  }
  VerifyCode(code: string) {
    this.verificationCode = code;
    this.VerificationCode.emit(code);
  }

  CanUpdate(val: boolean) {
    this.canUpdatePassword = val;
    this.CanUpdatePassword.emit(val);
  }
  CanResend(val: boolean) {
    this.canUpdatePassword = val;
    this.CanResendPassword.emit(val);
  }

  ngOnDestroy(): void {
    this.timerService.stopTimer();
    this.subTracker.releaseAllForComponent(this.componentName);
  }

}
