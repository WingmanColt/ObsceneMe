import { HttpInterceptor, HttpResponse, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable, tap, from, catchError } from "rxjs";

@Injectable()
export class CacheInterceptorService implements HttpInterceptor {

  env = environment;
  cacheStorage: Cache;
  constructor() {
    // you need to make sure that your browser supports cache
    if ('caches' in window) {
      caches.open(this.env.webName).then((res) => (this.cacheStorage = res));
    }
  }

  async put(req: string, body: any) {
    body = JSON.stringify(body);
    let response = new Response(body, {
      headers: {
        'Content-type': 'application/json',
      },
    });
    return await this.cacheStorage.put(req, response);
  }

  async get(req: string): Promise<HttpResponse<any>> {
    let response: Response = await this.cacheStorage.match(req);
    if (!response) throw Error('response not found');
    let body = await response.json();
    return new HttpResponse({ body, status: 200, statusText: 'ok' });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any> | any> {
    const useCache = req.params.get("_useCache");
    // remove interceptor params from requestreq = req.clone({params: req.params.delete("_useCache"),});// make sure that this browser support caches
    if (!('caches' in window)) return next.handle(req); const cacheRequest = req.urlWithParams;
    let observable = next.handle(req).pipe(
      tap((res: HttpResponse<any>) => {
        if (res instanceof HttpResponse && useCache) {
          this.put(cacheRequest, res.body);
        }
      })
    ); if (useCache) {
      return from(this.get(cacheRequest)).pipe(catchError((_) => observable));
    }
    return observable;
  }
}