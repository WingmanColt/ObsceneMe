import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';

@Injectable()
export class AuthGuard {

    public isUserAuthenticated: boolean;


    constructor(protected router: Router, protected accountService: AccountService) {
    }

    /*canActivate() {
        console.log(this.isUserAuthenticated);
        return this.isUserAuthenticated;
    }*/

    /*canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        this.accountService.authChanged.subscribe(res => {
            console.log(res);
            this.isUserAuthenticated = res;
        })

        if (this.accountService.getUser() == null) {
            console.log(this.isUserAuthenticated);
            //window.alert('Access Denied, Login is Required to Access This Page!');
            this.router.navigate(['/auth/login']);
            return false;
        }
        return true;
    }*/
}