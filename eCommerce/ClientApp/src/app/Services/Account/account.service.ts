import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, switchMap, of, filter, lastValueFrom, first, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebApiUrls } from 'src/app/configs/webApiUrls';
import { AuthResponse, ChangePasswordRequest, GoogleAuthDto, Login, PasswordVerificationRequest, Register, User, VerificationRequest, VerificationResponse, VerificationUser } from 'src/app/shared/classes/account';
import { CookieService } from 'ngx-cookie-service';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private _loggedInUser$ = new BehaviorSubject<AuthResponse>(null);
  private _currentUser: AuthResponse = null;  // Cached user, initially null
  private userDataLoading = false; // Prevents multiple simultaneous API calls

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private config: WebApiUrls
  ) {
    // Load user data once when the service is instantiated.
    this._currentUser = null; 
    this.loadUserData();
  }

  /** Load user data from the server or set unauthenticated state */
  private loadUserData(): void {
    if (!this._currentUser && !this.userDataLoading) {
      this.userDataLoading = true;
      const storedToken = this.cookieService.get('Authentication');
      if (storedToken) {
        this.fetchUserData().subscribe((userData) => {
          this._currentUser = userData;
          this._loggedInUser$.next(userData);
          this.userDataLoading = false;
        });
      } else {
        // No token found: mark user as unauthenticated.
        this.setUnauthenticatedState();
      }
    } else {
      // If already loaded, push the cached user.
      this._loggedInUser$.next(this._currentUser);
    }
  }

  /** Fetch user data from the server using stored token.
   *  Added error handling to set unauthenticated state if the request fails.
   */
  private fetchUserData(): Observable<AuthResponse> {
    const storedToken = this.cookieService.get('Authentication');
    if (storedToken) {
      return this.http.get<AuthResponse>(this.config.setting['GetCurrentUser']).pipe(
        switchMap((response: AuthResponse) => {
          this._currentUser = response; // Cache the fetched user
          this._loggedInUser$.next(response);
          return of(response);
        }),
        catchError((error) => {
          console.error('Error fetching user data:', error);
          this.setUnauthenticatedState();
          return of(this._currentUser);
        })
      );
    } else {
      this.setUnauthenticatedState();
      return of(this._currentUser);
    }
  }

  /** Set unauthenticated state */
  private setUnauthenticatedState(): void {
    const unauthenticatedUser: AuthResponse = {
      isAuthenticated: false,
      isEmailConfirmed: false,
      token: '',
      user: {} as User
    };
    this._currentUser = unauthenticatedUser;
    this._loggedInUser$.next(unauthenticatedUser);
    this.userDataLoading = false;
  }

  /** Public observable for real-time user state updates */
  public currentUser$ = this._loggedInUser$.asObservable();

  /** Getter for cached user data */
  get currentUser(): AuthResponse {
    return this._currentUser || this._loggedInUser$.value;
  }

  /** Ensures that user data is loaded before use */
  async waitForCurrentUser(): Promise<AuthResponse> {
    if (this._currentUser) {
      return this._currentUser;
    }
    return await lastValueFrom(
      this._loggedInUser$.pipe(
        filter(user => user !== null),
        first()
      )
    );
  }
  isLoggedIn(): boolean {
    return this._currentUser?.isAuthenticated === true;
  }
  async getUserDetails(): Promise<AuthResponse> {
    return await lastValueFrom(
      this.http.get<AuthResponse>(this.config.setting['GetCurrentUser'])
    );
  }

  async registerUser(request: Register): Promise<VerificationResponse> {
    return await lastValueFrom(
      this.http.post<VerificationResponse>(this.config.setting['RegisterUser'], request)
    );
  }

  async confirmUser(req: VerificationRequest): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['ConfirmUser'], req)
    );
  }

  async updateUserEmail(email: Register): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['UpdateUserEmail'], email)
    );
  }

  async updateUserDetails(body: User): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['UpdateUser'], body)
    );
  }

  async setUserAffiliate(): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['SetUserAffiliate'], null)
    );
  }

  async checkUserEmail(email: Register): Promise<AuthResponse> {
    return await lastValueFrom(
      this.http.post<AuthResponse>(this.config.setting['CheckUser'], email)
    );
  }

  async passwordChangeVerification(email: VerificationUser): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['PasswordChangeVerification'], email)
    );
  }

  async confirmPasswordChangeVerification(req: PasswordVerificationRequest): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['ConfirmPasswordChangeVerification'], req)
    );
  }

  async changePassword(req: ChangePasswordRequest): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['ChangePassword'], req)
    );
  }

  async resendVerification(): Promise<VerificationResponse> {
    return await lastValueFrom(
      this.http.get<VerificationResponse>(this.config.setting['ResendVerification'])
    );
  }

  /** Login User: Sets authentication token, fetches user data,
   *  and triggers a full page reload to update state.
   */
  async loginUser(body: Login): Promise<AuthResponse> {
    return await lastValueFrom(
      this.http.post<AuthResponse>(this.config.setting['LoginUser'], body).pipe(
        switchMap((response) => {
          if (response?.token?.length > 0) {
            this.setAuthCookie(response.token);
          }
          // Fetch user data from the server (using cached token) and then refresh the page.
          return this.fetchUserData().pipe(
            switchMap(() => {
              //setTimeout(() => window.location.reload(), 500);
              return of(response);
            })
          );
        }),
        catchError((error) => {
          console.error('Error during login:', error);
          throw error;
        })
      )
    );
  }

    async loginWithGoogle(body: GoogleAuthDto): Promise<AuthResponse> {
      return await lastValueFrom(
        this.http.post<AuthResponse>(this.config.setting['LoginWithGoogle'], body).pipe(
          switchMap((response) => {
            if (response?.token?.length > 0) {
              this.setAuthCookie(response.token);
            }
            return this.fetchUserData().pipe(
              switchMap(() => {
                return of(response);
              })
            );
          }),
            catchError((error: any) => {
              console.group('Google login failed');

              // Angular HttpErrorResponse
              console.log('Status:', error.status); // 0 = network/CORS, >=400 = HTTP error
              console.log('Status Text:', error.statusText);
              console.log('URL:', error.url);

              if (error.error instanceof ProgressEvent) {
                console.log('Network or CORS issue — no response from server');
              } else if (typeof error.error === 'string') {
                console.log('Raw server response (string):', error.error);
              } else if (typeof error.error === 'object') {
                console.log('Server error object:', error.error);
              }

              console.log('Full error object:', error);
              console.groupEnd();

              return throwError(() => error);
            })
        )
      );
    }

  /** Logout User: Calls the logout API, clears all authentication data,
   *  and reloads the page.
   */
  async logout(): Promise<void> {
    try {
      const logout = await lastValueFrom(this.http.post<OperationResult>(this.config.setting['LogoutUser'], null));
      if(logout.success) {
      this.clearAuthData();
      
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /** Sets the authentication token in cookies */
  private setAuthCookie(token: string): void {
    this.cookieService.set('Authentication', token, {
      expires: 31, // 31 days expiration
      path: '/',   // Accessible throughout the app
      secure: true,
      sameSite: 'Strict'
    });
  }

  /** Checks if token exists; if not, clears authentication data */
  private checkTokenExpiry(): void {
    const storedToken = this.cookieService.get('Authentication');
    if (!storedToken) {
      this.clearAuthData();
    }
  }

  /** Clears all cookies and resets authentication state */
  private clearAuthData(): void {
    Object.keys(this.cookieService.getAll()).forEach(cookieName => {
      this.cookieService.delete(cookieName, '/', '');
    });
    this._loggedInUser$.next(null);
    this._currentUser = null;
  }
}
