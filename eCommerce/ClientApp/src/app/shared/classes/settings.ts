export class Settings {
 language?: string;
 currency?: string;

 constructor(lang, curr) {
  this.language = lang;
  this.currency = curr;
 }
}
export class SettingEntities {
 CurrencyEntity?: Currency;
 LanguageEntity?: Language;

 constructor(curr, lang) {
  this.CurrencyEntity = curr;
  this.LanguageEntity = lang;
 }
}
export class Currency {
 name: string;
 currency: string;
 symbol: string;
 price: number;
 alignSymbolEnd: boolean;
}
export class Language {
 code: string;
 name: string;
}
export enum BreakpointLabel {
 None = "None",
 Mobile = "Mobile",
 Tablet = "Tablet",
 Desktop = "Desktop",
}
