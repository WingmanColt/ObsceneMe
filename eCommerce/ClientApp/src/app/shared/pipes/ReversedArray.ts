import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'reverseIterable' })
export class ReverseIterablePipe implements PipeTransform {
  private array: any[] = [];
  private reverseIterable: Iterable<any>;

  constructor() {
    this.reverseIterable = {
      [Symbol.iterator]: function* (this: ReverseIterablePipe) {
        for (let i = this.array.length - 1; i >= 0; i--) {
          yield this.array[i];
        }
      }.bind(this)
    };
  }

  transform<T>(value: T[]): Iterable<T> {
    this.array = value;
    return this.reverseIterable;
  }
}