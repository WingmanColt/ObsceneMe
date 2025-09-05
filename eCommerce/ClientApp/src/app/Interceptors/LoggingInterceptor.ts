import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { ErrorLoggingService } from '../Services/Logging/error-logging.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
    constructor(private errorLoggingService: ErrorLoggingService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const started = Date.now();
        let ok: string;

        return next.handle(req)
            .pipe(
                tap({
                    next: (event) => (ok = event instanceof HttpResponse ? 'succeeded' : ''),
                    error: (error) => {
                        ok = 'failed';
                        // Suppress redundant errors by ensuring this method only logs once
                        if (error instanceof HttpErrorResponse) {
                            this.logErrorResponse(req, error);
                        }
                        return throwError(() => error);
                    }
                }),
                finalize(() => {
                    if (ok === 'failed') {
                        const elapsed = Date.now() - started;
                        const msg = `${req.method} "${req.urlWithParams}" ${ok} in ${elapsed} ms.`;
                        this.errorLoggingService.logError(msg);
                    }
                })
            );
    }

    private logErrorResponse(req: HttpRequest<any>, error: HttpErrorResponse): void {
        const errorMsg = `${req.method} "${req.urlWithParams}" failed with error: ${error.statusText}`;
        // Optionally suppress logging of certain types of errors or error codes if desired.
        if (error.status !== 404) { // Example: Ignore 404 errors.
            this.errorLoggingService.logError(errorMsg);
        }
    }
}
