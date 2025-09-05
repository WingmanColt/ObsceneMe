import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, switchMap, shareReplay } from "rxjs";
import { WebApiUrls } from "src/app/configs/webApiUrls";

@Injectable({
 providedIn: "root",
})
export class BrandsService {

 private brandsData$ = new BehaviorSubject<void>(null);
 private subBrandsData$ = new BehaviorSubject<void>(null);
 private brandSeriesData$ = new BehaviorSubject<void>(null);

 constructor(private http: HttpClient, private config: WebApiUrls) {}

 public brands$ = this.fetchData(this.brandsData$, "GetUsedBrands");
 public subBrands$ = this.fetchData(this.subBrandsData$, "GetUsedSubBrands");
 public brandSeries$ = this.fetchData(this.brandSeriesData$, "GetUsedSeries");

 private fetchData(subject: BehaviorSubject<void>, urlKey: string) {
  return subject.pipe(
    switchMap(() =>
      this.http.get<any[]>(this.config.setting[urlKey], {
        params: { _useCache: "true" },
      })
    ),
    shareReplay(1)
  );
}
}