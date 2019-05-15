import { Injectable } from '@angular/core';

import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private accountService: AccountService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.includes(`${this.accountService.host}/user/resetPassword`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.accountService.host}/user/register`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.accountService.host}/user/login`)) {
            return next.handle(req);
        }

        if (req.url.includes(`https://maps.googleapis.com/`)) {
            return next.handle(req);
        }
        this.accountService.loadToken();
        const token = this.accountService.getToken();
        const request = req.clone({setHeaders: {Authorization: token}});
        return next.handle(request);
    }
}
