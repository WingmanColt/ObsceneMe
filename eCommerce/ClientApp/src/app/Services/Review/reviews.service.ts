import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, lastValueFrom, tap } from "rxjs";
import { WebApiUrls } from "../../configs/webApiUrls";
import { Review } from "../../shared/classes/review";
import { OperationResult } from "src/app/shared/interfaces/operationResult";
import { ProductReviewCard } from "src/app/shared/classes/reviewCard";

@Injectable({
    providedIn: "root",
})
export class ReviewsService {
    private reviewsCache: Review[] = [];
    private reviewsCache$: BehaviorSubject<Review[]> = new BehaviorSubject(null);

    private reviewCountCache: number = null;
    private reviewCountCache$: BehaviorSubject<number> = new BehaviorSubject(null);

    private productReviewCardCache: ProductReviewCard[] = [];
    private productReviewCardCache$: BehaviorSubject<ProductReviewCard[]> = new BehaviorSubject(null);

    private allReviewsCache: ProductReviewCard[] = [];
    private allReviewsCache$: BehaviorSubject<ProductReviewCard[]> = new BehaviorSubject(null);

    private operationResultCache$: BehaviorSubject<OperationResult> = new BehaviorSubject(null);

    constructor(private http: HttpClient, private config: WebApiUrls) { }

    public getReviews(review: Review): Observable<Review[]> {
        if (this.reviewsCache.length === 0) {
            return this.http.post<Review[]>(this.config.setting["GetReview"], review).pipe(
                tap((reviews) => {
                    this.reviewsCache = reviews;
                    this.reviewsCache$.next(this.reviewsCache);
                })
            );
        }
        return this.reviewsCache$;
    }

    public GetAllReviews(): Observable<any[]> {
        if (this.productReviewCardCache.length === 0) {
            return this.http.get<any[]>(this.config.setting["GetAllReviews"]).pipe(
                tap((entities) => {
                    this.productReviewCardCache = entities;
                    this.productReviewCardCache$.next(this.productReviewCardCache);
                })
            );
        }
        return this.productReviewCardCache$;
    }

    public getProductReviewCards(): Observable<any[]> {
        if (this.allReviewsCache.length === 0) {
            return this.http.get<any[]>(this.config.setting["GetReviewCards"]).pipe(
                tap((entities) => {
                    this.allReviewsCache = entities;
                    this.allReviewsCache$.next(this.allReviewsCache);
                })
            );
        }
        return this.allReviewsCache$;
    }

    public getReviewsCount(review: Review): Observable<number> {
        if (this.reviewCountCache === null) {
            return this.http.post<number>(this.config.setting["GetReviewCount"], review).pipe(
                tap((count) => {
                    this.reviewCountCache = count;
                    this.reviewCountCache$.next(this.reviewCountCache);
                })
            );
        }
        return this.reviewCountCache$;
    }

    async Create(body: Review): Promise<OperationResult> {
        this.invalidateCaches();
        return await lastValueFrom(
            this.http.post<OperationResult>(this.config.setting["AddReview"], body).pipe(
                tap((result) => this.operationResultCache$.next(result))
            )
        );
    }
    async SendToSupport(body: Review): Promise<OperationResult> {
        return await lastValueFrom(
            this.http.post<OperationResult>(this.config.setting["SendToSupport"], body).pipe(
                tap((result) => this.operationResultCache$.next(result))
            )
        );
    }
    async Delete(body: Review): Promise<OperationResult> {
        this.invalidateCaches();
        return await lastValueFrom(
            this.http.post<OperationResult>(this.config.setting["DeleteReview"], body).pipe(
                tap((result) => this.operationResultCache$.next(result))
            )
        );
    }

    private invalidateCaches(): void {
        this.reviewsCache = [];
        this.reviewCountCache = null;
        this.productReviewCardCache = null;
    }
}
