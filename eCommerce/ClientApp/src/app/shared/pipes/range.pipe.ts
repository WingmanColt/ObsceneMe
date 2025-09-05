import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
 name: 'range'
})
export class RangePipe implements PipeTransform {
 transform(value: any, start: number, end: number): any {
  const arr = [];
  for (let i = start; i <= end; i++) {
   arr.push(i);
  }
  return arr;
 }
}
