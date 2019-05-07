import { Injectable } from '@angular/core';
import { Server } from '../constants/server';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { AccountService } from '../services/account.service';
import { CacheService } from '../services/cache.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ChacheInterceptor implements HttpInterceptor {
    constant: Server = new Server();
    private host: string = this.constant.host;
    constructor(private accountService: AccountService, private cacheService: CacheService) {}
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (req.method !== 'GET') {
            this.cacheService.clearCache();
            return next.handle(req);
        }

        if (req.url.includes(`${this.host}/user/resetPassword`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.host}/user/register`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.host}/user/login`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.host}/user/findByUsername`)) {
            return next.handle(req);
        }

        const cachedResponse: HttpResponse<any> = this.cacheService.getCache(req.url);
        if (cachedResponse) {
            return of(cachedResponse);
        }

        return next.handle(req)
        .pipe(tap(event => {
           if (event instanceof HttpResponse) {
            this.cacheService.cacheRequest(req.url, event);
           }}));
    }
}
