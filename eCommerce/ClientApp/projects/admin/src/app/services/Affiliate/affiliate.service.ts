import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { adminApiUrls } from "../../configs/adminApiUrls";
import { AffiliateUser } from "src/app/shared/classes/affiliateUser";

@Injectable({
    providedIn: "root",
})
export class AffiliateService {

    constructor(private http: HttpClient, private config: adminApiUrls) { }

    public GetAffiliateUsers(): Observable<AffiliateUser[]> {
        return this.http.get<AffiliateUser[]>(this.config.setting["GetAllAffiliateUsers"]).pipe(catchError(this.errorHandler));
    }


    errorHandler(error) {
        let errorMessage = "";
        if (error.error instanceof ErrorEvent) {
            // Get client-side error
            errorMessage = error.error.message;
        } else {
            // Get server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }
}
