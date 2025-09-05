import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { WebApiUrls } from '../../configs/webApiUrls';
import { ICod } from '../../Interfaces/IPayments';
import { Token } from 'src/app/shared/classes/token';

@Injectable({
  providedIn: 'root'
})
export class CodService {

  constructor(private http: HttpClient, private config: WebApiUrls) { }

  async Create(input: any): Promise<ICod> {
    return await lastValueFrom(this.http.put<ICod>(this.config.setting['CreateCodOrder'], input));
  }

  async CheckSuccess(input: Token): Promise<any> {
    return await lastValueFrom(this.http.put<any>(this.config.setting['CheckCodSuccess'], input));
  }
}
