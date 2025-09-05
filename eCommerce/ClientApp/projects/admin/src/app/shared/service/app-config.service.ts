import { Injectable } from '@angular/core';
import { environment as devEnvironment } from 'environments/environment';
import { environment as prodEnvironment } from 'environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private currentConfig: any = { ...devEnvironment }; // Default to dev

  // Switch between environments
  switchEnvironment(env: 'dev' | 'prod'): void {
    this.currentConfig = env === 'prod' ? { ...prodEnvironment } : { ...devEnvironment };
  }

  // Get all configuration
  getConfig(): any {
    return this.currentConfig;
  }

  // Set or update specific configuration value
  setConfigValue(key: string, value: any): void {
    if (this.currentConfig.hasOwnProperty(key)) {
      this.currentConfig[key] = value;
    }
  }

  // Update configuration based on the environment
  updateConfig(newConfig: any): void {
    this.currentConfig = { ...this.currentConfig, ...newConfig };
    // Here you would typically persist the updated config to a backend or local storage
    console.log('Updated configuration:', this.currentConfig);
  }
}
