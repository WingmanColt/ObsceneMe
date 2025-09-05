import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom, shareReplay, switchMap } from 'rxjs';
import { WebApiUrls } from 'src/app/configs/webApiUrls';
import { VerificationUser } from 'src/app/shared/classes/account';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  private cachedVerifyCount$: Observable<number>;
  private verifyCountData$ = new BehaviorSubject<number>(undefined);


  constructor(private http: HttpClient, private config: WebApiUrls) { }

  public getVerificationsByEmailCount(email: VerificationUser): Observable<number> {
    // Create a new observable for the HTTP request and cache it
    this.cachedVerifyCount$ = this.verifyCountData$.pipe(
      switchMap(() => this.http.post<number>(this.config.setting["GetCountOfEmailVerifications"], email)),
      shareReplay(1)
    );

    return this.cachedVerifyCount$;
  }

  public updateVerificationsByEmailCount(count: number) {
    this.verifyCountData$.next(count);
  }


  async deleteVerificationsByEmailCount(email: VerificationUser): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['DeleteCountOfEmailVerifications'], email)
    );
  }
}
