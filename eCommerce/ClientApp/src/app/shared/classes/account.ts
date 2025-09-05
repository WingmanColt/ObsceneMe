// Products
export interface Account {
    FirstName?: string;
    LastName?: string;
    Email?: string;
    Password?: string;
    ConfirmPassword?: string;
    RememberMe: boolean;
    ErrorMessage: string;
    ReturnUrl: string;
}

export interface Login {
    Email?: string;
    Password?: string;
}
export interface GoogleAuthDto {
   idToken?: string;
}

export class VerificationUser {
    constructor(email: string) {
        this.Email = email;
    }
    Email?: string;
}
export class ResendVerify {
    constructor(email: string, oldToken: string) {
        this.Email = email;
        this.OldToken = oldToken;
    }
    Email?: string;
    OldToken?: string;
}
export interface Register {
    FirstName?: string;
    LastName?: string;
    Email?: string;
    Password?: string;
    ConfirmPassword?: string;
    ConfirmUser?: boolean;
    IsAffiliate?: boolean;
}
// Products
export class User {
  constructor(
    public id?: string,
    public email?: string,
    public emailConfirmed?: boolean,
    public fullName?:string,
    public firstName?: string,
    public lastName?: string,
    public isAffiliate?: boolean,
    public emailNotifyEnable?: boolean,
    public signInSocialEnable?: boolean,
    public country?: string,
    public city?: string,
    public address?: string,
    public postalCode?: string,
    public state?: string,
    public phoneNumber?: string,
    public token?: string // add token here if needed
  ) {}
}
export class AuthResponse {
    isAuthenticated?: boolean;
    isEmailConfirmed?: boolean;
    token?: string;
    user?: User;
    message?: string;
}
export class VerificationResponse {
    emailConfirmed?: boolean;
    token?: string;
    userId?: string;
    message?: string;
}



export class PasswordVerificationRequest {
    constructor(email: string, code: string, createdOn: string, newpassword: string, confirmnewPassword: string) {
        this.email = email;
        this.code = code;
        this.createdOn = createdOn;
        this.newPassword = newpassword;
        this.confirmNewPassword = confirmnewPassword;
    }

    email: string;
    newPassword: string;
    confirmNewPassword: string;
    code: string;
    createdOn: string;
}

export class VerificationRequest {
    constructor(email: string, code: string, createdOn: string) {
        this.email = email;
        this.code = code;
        this.createdOn = createdOn;
    }

    email: string;
    code: string;
    createdOn: string;
}
export class ChangePasswordRequest {
    constructor(password: string, confirmPassword: string, createdOn: string) {
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.createdOn = createdOn;
    }

    password: string;
    confirmPassword: string;
    createdOn: string;
}