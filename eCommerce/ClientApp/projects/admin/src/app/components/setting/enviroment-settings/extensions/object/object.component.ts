import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-object',
  template: `
    <div *ngFor="let key of objectKeys()">
      <label><strong>{{ key }}:</strong></label>

      <!-- Handle nested arrays -->
      <ng-container *ngIf="isArray(objectData[key])">
        <app-array [arrayData]="objectData[key]"></app-array>
      </ng-container>

      <!-- Handle nested objects -->
      <ng-container *ngIf="isObject(objectData[key])">
        <app-object [objectData]="objectData[key]"></app-object>
      </ng-container>

      <!-- Handle primitive values -->
      <ng-container *ngIf="!isArray(objectData[key]) && !isObject(objectData[key])">
        <app-primitive [value]="objectData[key]" (updateValue)="objectData[key] = $event"></app-primitive>
      </ng-container>
    </div>
  `
})
export class ObjectComponent {
  @Input() objectData: any = {};

  objectKeys(): string[] {
    return Object.keys(this.objectData);
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  isObject(val: any): boolean {
    return val && typeof val === 'object' && !Array.isArray(val);
  }
}
