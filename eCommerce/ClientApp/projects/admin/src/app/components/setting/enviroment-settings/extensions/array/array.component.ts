import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-array',
  template: `
    <ul>
      <li *ngFor="let item of arrayData; let i = index">
        <!-- Handle nested arrays -->
        <ng-container *ngIf="isArray(item)">
          <button class="btn btn-secondary mt-2" (click)="toggleNested(i)">
            {{ nestedExpanded[i] ? 'Hide Nested Array' : 'Show Nested Array' }}
          </button>
          <app-array *ngIf="nestedExpanded[i]" [arrayData]="item"></app-array>
        </ng-container>

        <!-- Handle nested objects -->
        <ng-container *ngIf="isObject(item)">
          <app-object [objectData]="item"></app-object>
        </ng-container>

        <!-- Handle primitive values -->
        <ng-container *ngIf="!isArray(item) && !isObject(item)">
          <app-primitive [value]="item" (updateValue)="arrayData[i] = $event"></app-primitive>
        </ng-container>
      </li>
    </ul>
  `
})
export class ArrayComponent {
  @Input() arrayData: any[] = [];
  nestedExpanded: { [key: number]: boolean } = {};

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  isObject(val: any): boolean {
    return val && typeof val === 'object' && !Array.isArray(val);
  }

  toggleNested(index: number): void {
    this.nestedExpanded[index] = !this.nestedExpanded[index];
  }
}
