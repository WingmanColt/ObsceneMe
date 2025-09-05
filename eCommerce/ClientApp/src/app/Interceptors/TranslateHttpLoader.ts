import { HttpBackend, HttpClient, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

export class TranslateHttpLoader implements TranslateLoader {
  constructor(private _handler: HttpBackend, private _resourcesPrefix: string[]) {}

  public getTranslation(lang: string): Observable<any> {
    const httpClient = new HttpClient(this._handler); // Only create the HttpClient once
    const requests = this._resourcesPrefix.map((prefix) => {
      const path = `${prefix}${lang}.json`;
      
      return httpClient.get(path).pipe(
        catchError((res) => {
          console.group('MegaMultiTranslateHttpLoader');
          console.error('Something went wrong for the following translation file:', path);
          console.error('Content of the error: ', res);
          console.groupEnd();
          return of({}); // Return empty object in case of an error
        })
      );
    });

    // Merge all responses into a single object
    return forkJoin(requests).pipe(
      mergeMap((responses: any[]) => {
        return of(Object.assign({}, ...responses)); // Merges the JSON objects from each translation file
      })
    );
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const InterceptorSkipHeader = 'X-Skip-Interceptor';

    if (request.headers.has(InterceptorSkipHeader)) {
      const headers = request.headers.delete(InterceptorSkipHeader);
      return next.handle(request.clone({ headers }));
    }

    return next.handle(request); // Ensure it returns next handle if no header match
  }
}
