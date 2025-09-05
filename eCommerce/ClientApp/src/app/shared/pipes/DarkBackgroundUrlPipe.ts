import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'asUrlDarker'
})

export class DarkBackgroundUrlPipe implements PipeTransform {
  transform(value: string): string {
    return `linear-gradient(rgba(0, 0, 0, 0.5),
                     rgba(0, 0, 0, 0.5)), url(${value})`
  }
}
