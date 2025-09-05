import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-primitive',
  template: `
    <ng-container *ngIf="isString(value)">
      <input [(ngModel)]="value" class="form-control mb-2" type="text" (ngModelChange)="onUpdate($event)" />
    </ng-container>

    <ng-container *ngIf="isNumber(value)">
      <input [(ngModel)]="value" class="form-control mb-2" type="number" (ngModelChange)="onUpdate($event)" />
    </ng-container>

    <ng-container *ngIf="isBoolean(value)">
      <input [(ngModel)]="value" class="form-check-input" type="checkbox" (ngModelChange)="onUpdate($event)" />
    </ng-container>
  `
})
export class PrimitiveComponent {
  @Input() value: any;
  @Output() updateValue = new EventEmitter<any>();

  onUpdate(newValue: any): void {
    this.updateValue.emit(newValue);
  }

  isString(val: any): boolean {
    return typeof val === 'string';
  }

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }

  isBoolean(val: any): boolean {
    return typeof val === 'boolean';
  }
}
