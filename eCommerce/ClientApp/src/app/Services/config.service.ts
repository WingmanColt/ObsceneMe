import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  getSetting(key: keyof typeof environment.serviceActivation): boolean {
    return environment.serviceActivation[key];
  }
}
