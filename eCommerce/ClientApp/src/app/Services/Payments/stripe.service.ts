import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { WebApiUrls } from '../../configs/webApiUrls';
import { IStripe } from '../../Interfaces/IPayments';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  constructor(private http: HttpClient, private config: WebApiUrls) { }

  async Create(input: any): Promise<IStripe> {
    return await lastValueFrom(this.http.put<IStripe>(this.config.setting['CreateStripeOrder'], input));
  }

  async CheckSuccess(session_id: any): Promise<any> {
    let params = new HttpParams().set('session_id', session_id);
    return await lastValueFrom(this.http.get(this.config.setting['CheckStripeSuccess'], { params: params, responseType: 'text' }));
  }

}
