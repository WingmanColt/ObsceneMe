import { Pipe, PipeTransform } from '@angular/core';
import { Currency } from '../classes/settings';
import { environment } from 'environments/environment';

@Pipe({ name: 'asCurrency', pure: false })
export class InternalCurrencyPipe implements PipeTransform {

  constructor() {
  }
  transform(value: any, currency: Currency): string {
    const result = currency.alignSymbolEnd ?
      value + ' ' + currency.symbol :
      currency.symbol + ' ' + value;
    return result;
  }
}

@Pipe({ name: 'getCurrencyEntity' })
export class CurrencyEntityPipe implements PipeTransform {

  private env = environment;
  public currenciesArray: Currency[] = this.env.countriesSettings.currenciesArray;

  constructor() { }

  transform(value: number, currencyString: string): string {
    const res = this.currenciesArray?.find(item => item.currency === currencyString);
    return res.alignSymbolEnd ? value + ' ' + res.symbol : res.symbol + ' ' + value;
  }
}

/*

@Pipe({ name: 'asCurrencyAsync', pure: false })
export class InternalCurrencyAsyncPipe implements PipeTransform {

  private currency: Currency;
  private subscription: Subscription;
  private lastResult: any = null;
  private lastParam: any | (() => any | Promise<any>) = null;

  constructor(
    private _ref: ChangeDetectorRef,
    private baseService: BaseService) {
    this.subscription = baseService.getSettings.subscribe((x: Currency) => {
      this.currency = x;
    })
  }

  ngOnDestroy(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  public transform(varOrFunc: any | (() => any | Promise<any>)): any {
    if (this.lastParam === varOrFunc) {
      return this.lastResult;
    }
    this.lastParam = varOrFunc;
    // console.log(varOrFunc)
    // if (varOrFunc instanceof Function) {
    // console.log('func')
    const result = varOrFunc;
    //console.log(result)
      if (result.then) {
         this.lastResult = null;
         result.then(r => this.updateResult(r));
         return null;
       } else {
         this.lastResult = result;
         return result;
       }
    //  } else {
    //   this.lastResult = varOrFunc;
    //   return varOrFunc;
    // }

    return this.updateResult(varOrFunc);
  }

  updateResult(val: any) {
    const newValue = val * this.currency.price;

    this.lastResult = this.currency.alignSymbolEnd ?
      newValue + ' ' + this.currency.symbol :
      this.currency.symbol + ' ' + newValue;

    this._ref.detectChanges();
  }
}*/
