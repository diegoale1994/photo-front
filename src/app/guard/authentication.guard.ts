import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { AlertService } from '../services/alert.service';
import { AlertType } from '../enum/alert-type.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  constructor(private accountService: AccountService, private alertService: AlertService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean  {
    return this.isLoggedIn(state.url);
  }
  private isLoggedIn(url: string): boolean {
    if (this.accountService.isLoggedIn()) {
      return true;
    }
    this.accountService.redirectURL = url;
    this.router.navigate(['/login']);
    this.alertService.showAlert('You Must be logged in to the access page', AlertType.DANGER);
    return false;
  }
}
