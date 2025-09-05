import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthResponseDto, UserForAuthenticationDto } from 'src/app/Interfaces/Authentication';
import { Account } from 'src/app/shared/classes/account';
import { IUser } from '../../../classes/account';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  private returnUrl: string;
  private user: IUser;

  form: FormGroup;
  public isUserAuthenticated: boolean = false;
  public loginForm: UntypedFormGroup;
  public registerForm: UntypedFormGroup;
  public active = 1;

  constructor(
    private router: Router, 
    private accountService: AccountService,
    private route: ActivatedRoute) { this.buildForm(); }

  buildForm() {
    this.form = new FormGroup({
      Email: new FormControl('', [Validators.required, Validators.email]),
      Password: new FormControl('', [Validators.required, Validators.min(5)])
    });

    this.registerForm = new FormGroup({
      Email: new FormControl('', [Validators.required, Validators.email]),
      Password: new FormControl('', [Validators.required, Validators.min(5)]),
      ConfirmPassword: new FormControl('', [Validators.required, Validators.min(5)]),
      FirstName: new FormControl('', [Validators.required, Validators.min(5)]),
      LastName: new FormControl('', [Validators.required, Validators.min(5)])
    });
  }

  /*  constructor(private formBuilder: UntypedFormBuilder) {
      this.createLoginForm();
      this.createRegisterForm();
    }*/

  owlcarousel = [
    {
      title: "Welcome to Multikart",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.",
    },
    {
      title: "Welcome to Multikart",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.",
    },
    {
      title: "Welcome to Multikart",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.",
    }
  ]
  owlcarouselOptions = {
    loop: true,
    items: 1,
    dots: true
  };

  get emailControl() {
    return this.form.get('Email');
  }
  get passwordControl() {
    return this.form.get('Password');
  }


  get EmailControl() {
    return this.registerForm.get('Email');
  }
  get PasswordControl() {
    return this.registerForm.get('Password');
  }
  get ConfirmPasswordControl() {
    return this.registerForm.get('ConfirmPassword');
  }
  get FirstnameControl() {
    return this.registerForm.get('FirstName');
  }
  get LastnameControl() {
    return this.registerForm.get('LastName');
  }


  ngOnInit(): void {
    this.accountService.getUser().subscribe((response) => {
      this.user = response;
      console.log(this.user);

      if (this.user) {
        this.router.navigate(['/'])
      }
    });


    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }



  onSubmitLogin(body: UserForAuthenticationDto) {
    this.accountService.loginUser(body).subscribe({
      next: (res: AuthResponseDto) => {
        localStorage.setItem("token", res.token);
        this.accountService.sendAuthStateChangeNotification(res.isAuthSuccessful);
        this.router.navigate([this.returnUrl])
      },
      error: (response) => {
      }
    });
  }

  onSubmitRegister(body: Account) {
    this.accountService.registerUser(body).subscribe({
      next: (res: AuthResponseDto) => {
        localStorage.setItem("token", res.token);
        this.accountService.sendAuthStateChangeNotification(res.isAuthSuccessful);
        this.router.navigate([this.returnUrl])
      },
      error: (response) => {
      }
    });
  }
}
