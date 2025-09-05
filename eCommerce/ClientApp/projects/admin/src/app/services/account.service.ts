import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserForAuthentication, UserForAuthenticationDto, AuthResponseDto } from '../Interfaces/Authentication';
import { IUser, Account } from '../classes/account';
import { adminApiUrls } from '../configs/adminApiUrls';


@Injectable({
  providedIn: 'root'
})

export class AccountService {
 /* public user: UserForAuthentication =
    {
      email: "supp.bgsell@gmail.com",
      password: "Badass6615$"
    };

  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type:": "application/json",
      //"CJ-Access-Token": '"' + environment.cjapi_token + '"'
    })
  }*/
  private authChangeSub = new Subject<boolean>()
  public authChanged = this.authChangeSub.asObservable();

  private loggedUserChangeSub = new Subject<IUser>()
  public isUserLogged = this.loggedUserChangeSub.asObservable();

  constructor(private http: HttpClient, private config: adminApiUrls) {

  }

  public sendAuthStateChangeNotification = (isAuthenticated: boolean) => {
    this.authChangeSub.next(isAuthenticated);
  }


  public loginUser(body: UserForAuthenticationDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(this.config.setting['LoginUser'], body);
  }

  public registerUser(request: Account): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(this.config.setting['RegisterUser'], request);
  }

  public logout() {
    localStorage.removeItem("token");
    this.sendAuthStateChangeNotification(false);
  }

  public getUser(): Observable<IUser> {
    return this.http.get<IUser>(this.config.setting['GetUser'], {
     /* headers: {
        "accessToken": '"' + this.getAccessToken() + '"',
      }*/
    });
  }

  /*public getAccessToken(): string | null {
    return localStorage.getItem("token");
  }

  public getCJAccessToken() {
    //console.log(this.user);
    return this.http.post<any>("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", this.user, this.httpOptions);
  }*/

}
