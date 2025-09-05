import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../../shared/service/app-config.service';

@Component({
  selector: 'app-enviroment-settings',
  templateUrl: './enviroment-settings.component.html',
  styleUrls: ['./enviroment-settings.component.scss']
})
export class EnviromentSettingsComponent implements OnInit {

  currentEnv: 'dev' | 'prod' = 'dev';
  allConfig: any = {};
  openSettings: { [key: string]: boolean } = {}; // To manage open/close state of settings
  inputWidth = 300; // Set a fixed width for inputs
  expandedConfig: { [key: string]: boolean } = {};
  editMode: { [key: string]: boolean } = {}; // Track edit mode for each config key
  nestedExpanded: { [key: string]: boolean } = {}; // Track nested array expansion

  constructor(private appConfigService: AppConfigService) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  // Load current environment config
  loadConfig(): void {
    this.allConfig = this.appConfigService.getConfig();
    console.log('Loaded Config:', this.allConfig); // Debugging statement
    this.initializeOpenSettings();
  }

  onEnvChange(event: any): void {
    this.currentEnv = event.target.value;
    this.appConfigService.switchEnvironment(this.currentEnv);
    this.allConfig = this.appConfigService.getConfig(); // Refresh config
    console.log('Config after Env Change:', this.allConfig); // Debugging statement
    this.initializeOpenSettings(); // Reinitialize openSettings state
  }

  // Initialize openSettings based on current config keys
  initializeOpenSettings(): void {
    this.openSettings = Object.keys(this.allConfig).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    console.log('Initialized Open Settings:', this.openSettings); // Debugging statement
  }

  // Toggle the settings detail view
  toggleSettings(key: string): void {
    this.openSettings[key] = !this.openSettings[key];
    console.log('Toggled Settings:', key, this.openSettings); // Debugging statement
  }

  // Save the entire config object
  updateAllConfig(): void {
    this.appConfigService.updateConfig(this.allConfig);
    alert('Configuration updated successfully!');
  }
  toggleNestedDetails(key: string, nestedArray: any[]): void {
    this.nestedExpanded[key] = !this.nestedExpanded[key];
  }
  toggleEdit(key: string): void {
    this.editMode[key] = !this.editMode[key];
  }
  saveEdit(key: string): void {
    this.appConfigService.setConfigValue(key, this.allConfig[key]);
    this.toggleEdit(key); // Optionally switch back to display mode
  }

  toggleDetails(key: string): void {
    this.expandedConfig[key] = !this.expandedConfig[key];
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  isObject(val: any): boolean {
    return val && typeof val === 'object' && !Array.isArray(val);
  }
}
