import { Component, OnInit, Output, Input, EventEmitter } from "@angular/core";
import { environment } from "environments/environment";
import { BaseService } from "src/app/Services/base.service";

@Component({
  selector: "app-price",
  templateUrl: "./price.component.html",
  styleUrls: ["./price.component.scss"],
})
export class PriceComponent implements OnInit {
  @Output() onPriceChange: EventEmitter<any> = new EventEmitter<any>();

  // Define min and max values
  @Input() min: number = 0;
  @Input() max: number = 5000; // This will be updated dynamically
  @Input() constantMax: number = 10000; // Set to your desired value
  @Input() isCollapsed: boolean = false;

  // New inputs for range selection
  @Input() inputFrom: number = 0;
  @Input() inputTo: number = 0;

  // Store user-defined min and max
  userMin: number = this.min;
  userMax: number = this.max;

  // Updated price ranges
  priceOptions = environment.pagesSettings.CollectionSettings.priceOptions;
  public priceRanges: { from: number; to: number | null; label: string; active: boolean }[] = [];

  constructor(public baseService: BaseService) {}

  ngOnInit(): void {
    this.priceRanges = this.priceOptions;
    this.setUserDefinedValues();
  }

  setUserDefinedValues() {
    // Update userMin and userMax based on input values
    this.userMin = this.inputFrom || this.min; // Default to min if inputFrom is 0
    this.userMax = this.inputTo || this.max; // Default to max if inputTo is 0

    // Set the active range based on userMin and userMax
    this.setActiveRange();
  }

  setActiveRange() {
    this.priceRanges.forEach(range => {
      range.active = this.userMin >= (range.from ?? this.min) && (this.userMax <= (range.to ?? this.constantMax));
    });
  }

  onInputChange() {
    // Update the user-defined values when inputs change
    this.userMin = this.userMin < this.min ? this.min : this.userMin; // Ensure userMin is not less than min
    this.userMax = this.userMax > this.max ? this.max : this.userMax; // Ensure userMax is not greater than max

    // Emit the price change
    this.onPriceChange.emit({ minPrice: this.userMin, maxPrice: this.userMax });
    this.setActiveRange(); // Update active states
  }

  selectPriceRange(from: number | null, to: number | null) {
    // Check if the clicked range is already selected
    if (this.userMin === from && (this.userMax === to || to === null)) {
      // Deselect the range by resetting to default values (or you can set to input values)
      this.userMin = this.min;
      this.userMax = this.max;
    } else {
      // Check if the last range is selected (More than max case)
      if (to === null) {
        this.userMin = this.max; // Set userMin to original max
        this.userMax = this.constantMax; // Set userMax to constantMax
      } else {
        // Set userMin and userMax to the selected range
        this.userMin = from!;
        this.userMax = to!;
      }
    }

    // Emit the updated range
    this.onPriceChange.emit({ minPrice: this.userMin, maxPrice: this.userMax });

    // Update active states for the ranges
    this.setActiveRange();
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed; // Toggle the collapsed state
  }
}


/*import { Component, OnInit, Output, Input, EventEmitter } from "@angular/core";
import { BaseService } from "src/app/Services/base.service";

@Component({
  selector: "app-price",
  templateUrl: "./price.component.html",
  styleUrls: ["./price.component.scss"],
})
export class PriceComponent implements OnInit {
  @Output() onPriceChange: EventEmitter<any> = new EventEmitter<any>();

  // Define min and max values
  @Input() min: number = 0;
  @Input() max: number = 5000; // This will be updated dynamically
  @Input() constantMax: number = 10000; // Set to your desired value
  @Input() isCollapsed: boolean = false;

  // New inputs for range selection
  @Input() inputFrom: number = 0;
  @Input() inputTo: number = 0;

  // Store user-defined min and max
  userMin: number = this.min;
  userMax: number = this.max;

  public priceRanges: { from: number; to: number; label: string; active: boolean }[] = [];

  constructor(public baseService: BaseService) {}

  ngOnInit(): void {
    this.calculatePriceRanges();
    this.setUserDefinedValues();
  }

  calculatePriceRanges() {
    const ranges = [];
    let currentMin = this.userMin;

    // Define your increments
    const increments = [50, 150, 250];
    let incrementIndex = 0;

    while (ranges.length < 7) {
      let nextMax = currentMin + increments[incrementIndex];

      // Ensure the last range goes up to user-defined max
      if (ranges.length === 6) {
        nextMax = this.userMax; // Set to user-defined max
      }

      ranges.push({ from: currentMin, to: nextMax, label: `${currentMin} - ${nextMax}`, active: false });

      currentMin = nextMax; // Move to the next minimum
      incrementIndex = (incrementIndex + 1) % increments.length; // Cycle through increments
    }

    // Add the last "More than" range
    ranges.push({ from: this.userMax, to: null, label: `Повече от ${this.userMax}`, active: false });

    this.priceRanges = ranges;
  }

  setUserDefinedValues() {
    // Update userMin and userMax based on input values
    this.userMin = this.inputFrom || this.min; // Default to min if inputFrom is 0
    this.userMax = this.inputTo || this.max; // Default to max if inputTo is 0

    // Set the active range based on userMin and userMax
    this.setActiveRange();
  }

  setActiveRange() {
    this.priceRanges.forEach(range => {
      range.active = this.userMin >= range.from && (this.userMax <= range.to || range.to === null);
    });
  }

  onInputChange() {
    // Update the user-defined values when inputs change
    this.userMin = this.userMin < this.min ? this.min : this.userMin; // Ensure userMin is not less than min
    this.userMax = this.userMax > this.max ? this.max : this.userMax; // Ensure userMax is not greater than max

    // Emit the price change
    this.onPriceChange.emit({ minPrice: this.userMin, maxPrice: this.userMax });
    this.setActiveRange(); // Update active states
  }

  selectPriceRange(from: number, to: number | null) {
    // Check if the clicked range is already selected
    if (this.userMin === from && (this.userMax === to || to === null)) {
      // Deselect the range by resetting to default values (or you can set to input values)
      this.userMin = this.min;
      this.userMax = this.max;
    } else {
      // Check if the last range is selected (More than max case)
      if (to === null) {
        this.userMin = this.max; // Set userMin to original max
        this.userMax = this.constantMax; // Set userMax to constantMax
      } else {
        // Set userMin and userMax to the selected range
        this.userMin = from;
        this.userMax = to;
      }
    }
  
    // Emit the updated range
    this.onPriceChange.emit({ minPrice: this.userMin, maxPrice: this.userMax });
  
    // Update active states for the ranges
    this.setActiveRange();
  }
  
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed; // Toggle the collapsed state
  }
}
*/