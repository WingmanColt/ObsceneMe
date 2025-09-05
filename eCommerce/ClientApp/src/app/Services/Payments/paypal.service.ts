import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { WebApiUrls } from '../../configs/webApiUrls';
import { IPayPal } from '../../Interfaces/IPayments';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  constructor(private http: HttpClient, private config: WebApiUrls) { }

  async Create(input: any): Promise<IPayPal> {
    return await lastValueFrom(this.http.put<IPayPal>(this.config.setting['CreatePayPalOrder'], input));
  }

  async CheckSuccess(token: any): Promise<any> {
    let params = new HttpParams().set('token', token);
    return await lastValueFrom(this.http.get(this.config.setting['CheckPayPalSuccess'], { params: params, responseType: 'text' }));
  }

}
