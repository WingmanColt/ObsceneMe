import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BackgroundUrlPipe } from './BackgroundUrlPipe';
import { DarkBackgroundUrlPipe } from './DarkBackgroundUrlPipe';
import { DateFormatPipe } from './DateFormat';
import { DiscountPipe } from './discount.pipe';
import { SafePipe } from './safe.pipe';
import { CurrencyEntityPipe, InternalCurrencyPipe } from './CurrencyPipe';
import { RangePipe } from './range.pipe';

@NgModule({
    declarations: [
        DiscountPipe,
        DateFormatPipe,
        BackgroundUrlPipe,
        DarkBackgroundUrlPipe,
        SafePipe,
        InternalCurrencyPipe,
        CurrencyEntityPipe,
        RangePipe
    ],
    imports: [
        CommonModule
    ],
    exports: [
        DiscountPipe,
        DateFormatPipe,
        BackgroundUrlPipe,
        DarkBackgroundUrlPipe,
        SafePipe,
        InternalCurrencyPipe,
        CurrencyEntityPipe,
        RangePipe
    ]
})
export class PipesModule { }