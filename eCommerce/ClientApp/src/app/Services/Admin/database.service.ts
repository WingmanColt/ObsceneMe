import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { WebApiUrls } from 'src/app/configs/webApiUrls';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private http: HttpClient, private config: WebApiUrls) { }

  async refreshPages(): Promise<OperationResult> {
    return lastValueFrom(this.http.get<OperationResult>(this.config.setting['RefreshPages']));
  }
}
