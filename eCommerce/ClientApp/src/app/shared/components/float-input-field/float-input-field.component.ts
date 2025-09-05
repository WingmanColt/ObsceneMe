import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-float-input-field',
  templateUrl: './float-input-field.component.html',
  styleUrls: ['./float-input-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FloatInputFieldComponent),
      multi: true,
    },
  ],
})
export class FloatInputFieldComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  //@Input() control;

  value: string = ''; // to bind the value
  onChange = (value: string) => {}; // function to update the form control
  onTouched = () => {}; // function to mark the control as touched

  // This method is called by Angular when setting the value of the input
  writeValue(value: any): void {
    this.value = value || '';
  }
  
  // Register the change handler
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  // Register the touched handler
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  // Handle changes in the input field
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onChange(input.value); // Update the form control on input change
  }

  // Mark the control as touched on blur
  onBlur(): void {
    this.onTouched(); // Mark the control as touched when the input loses focus
  }
}
